"""Chrome DevTools Protocol (CDP) Headless Browser Automation in pure Python."""
import base64
import json
import os
import random
import shutil
import socket
import struct
import subprocess
import tempfile
import threading
import time
import urllib.request
from typing import Any, Dict, List, Optional


class CDPWebSocket:
    """Lightweight RFC 6455 WebSocket client using Python standard library socket."""

    def __init__(self, ws_url: str, timeout: float = 12.0):
        self.ws_url = ws_url
        self.timeout = timeout
        self.sock: Optional[socket.socket] = None
        self._lock = threading.Lock()
        self._recv_lock = threading.Lock()
        self._connect()

    def _connect(self):
        url_clean = self.ws_url.replace("ws://", "")
        parts = url_clean.split("/", 1)
        host_port = parts[0]
        path = "/" + (parts[1] if len(parts) > 1 else "")
        if ":" in host_port:
            host, port_str = host_port.split(":")
            port = int(port_str)
        else:
            host = host_port
            port = 80

        self.sock = socket.create_connection((host, port), timeout=self.timeout)
        self.sock.settimeout(self.timeout)
        sec_key = base64.b64encode(os.urandom(16)).decode()
        handshake = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {host_port}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {sec_key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(handshake.encode("utf-8"))

        # Read handshake response
        response = b""
        while b"\r\n\r\n" not in response:
            chunk = self.sock.recv(4096)
            if not chunk:
                raise ConnectionError("WebSocket handshake connection closed by server")
            response += chunk

        if b"101" not in response:
            raise ConnectionError(f"WebSocket handshake failed: {response[:200].decode('latin1')}")

    def send_text(self, text: str):
        with self._lock:
            if not self.sock:
                raise ConnectionError("Socket is not connected")
            data = text.encode("utf-8")
            length = len(data)
            mask_key = os.urandom(4)
            masked_data = bytes(b ^ mask_key[i % 4] for i, b in enumerate(data))

            if length < 126:
                header = bytes([0x81, 0x80 | length]) + mask_key
            elif length < 65536:
                header = bytes([0x81, 0x80 | 126]) + struct.pack(">H", length) + mask_key
            else:
                header = bytes([0x81, 0x80 | 127]) + struct.pack(">Q", length) + mask_key

            self.sock.sendall(header + masked_data)

    def recv_text(self) -> str:
        with self._recv_lock:
            if not self.sock:
                raise ConnectionError("Socket is not connected")
            fragments = []
            while True:
                # Read 2 byte header
                header = self._recv_exact(2)
                b1, b2 = header[0], header[1]
                fin = (b1 & 0x80) != 0
                opcode = b1 & 0x0F
                has_mask = (b2 & 0x80) != 0
                payload_len = b2 & 0x7F

                if payload_len == 126:
                    ext = self._recv_exact(2)
                    payload_len = struct.unpack(">H", ext)[0]
                elif payload_len == 127:
                    ext = self._recv_exact(8)
                    payload_len = struct.unpack(">Q", ext)[0]

                mask_key = self._recv_exact(4) if has_mask else None
                payload = self._recv_exact(payload_len)

                if has_mask and mask_key:
                    payload = bytes(b ^ mask_key[i % 4] for i, b in enumerate(payload))

                if opcode == 0x8:  # Close frame
                    self.close()
                    raise ConnectionError("WebSocket received close frame")
                elif opcode == 0x9:  # Ping
                    with self._lock:
                        pong = bytes([0x8A, 0x00])
                        self.sock.sendall(pong)
                    continue
                elif opcode == 0xA:  # Pong
                    continue
                elif opcode in (0x1, 0x0):  # Text or continuation
                    fragments.append(payload)
                    if fin:
                        break
                else:
                    fragments.append(payload)
                    if fin:
                        break

            return b"".join(fragments).decode("utf-8")

    def _recv_exact(self, n: int) -> bytes:
        data = bytearray()
        while len(data) < n:
            packet = self.sock.recv(n - len(data))
            if not packet:
                raise ConnectionError("Socket closed prematurely while receiving frame")
            data.extend(packet)
        return bytes(data)

    def close(self):
        with self._lock:
            if self.sock:
                try:
                    self.sock.close()
                except Exception:
                    pass
                self.sock = None


class BrowserSession:
    """Automates Chrome or Edge via DevTools Protocol (CDP)."""

    def __init__(self, port: Optional[int] = None, timeout: float = 15.0):
        self.port = port or random.randint(9300, 9800)
        self.timeout = timeout
        self.temp_dir: Optional[str] = None
        self.process: Optional[subprocess.Popen] = None
        self.ws: Optional[CDPWebSocket] = None
        self.msg_id = 1
        self.console_logs: List[Dict[str, Any]] = []
        self.console_errors: List[str] = []
        self.page_errors: List[str] = []
        self.event_thread: Optional[threading.Thread] = None
        self._running = False
        self._pending_responses: Dict[int, Any] = {}
        self._resp_events: Dict[int, threading.Event] = {}
        self._lock = threading.Lock()

    @staticmethod
    def find_browser_exe() -> str:
        candidates = [
            r"C:\Program Files\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
            os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"),
        ]
        for p in candidates:
            if os.path.exists(p):
                return p
        raise FileNotFoundError("Neither Google Chrome nor Microsoft Edge was found on this system.")

    def launch(self):
        exe = self.find_browser_exe()
        self.temp_dir = tempfile.mkdtemp(prefix=f"cdp_profile_{self.port}_")
        args = [
            exe,
            "--headless=new",
            f"--remote-debugging-port={self.port}",
            f"--user-data-dir={self.temp_dir}",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-extensions",
            "--disable-default-apps",
            "--disable-background-networking",
            "--disable-sync",
            "--disable-translate",
            "--hide-scrollbars",
            "--metrics-recording-only",
            "--mute-audio",
            "--no-first-run",
            "--no-default-browser-check",
            "--allow-file-access-from-files",
            "about:blank",
        ]
        self.process = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        # Wait for CDP endpoint
        ws_url = None
        for _ in range(35):
            try:
                res = urllib.request.urlopen(f"http://127.0.0.1:{self.port}/json/list", timeout=1.0)
                pages = json.loads(res.read().decode())
                page_targets = [p for p in pages if p.get("type") == "page"]
                if page_targets and "webSocketDebuggerUrl" in page_targets[0]:
                    ws_url = page_targets[0]["webSocketDebuggerUrl"]
                    break
            except Exception:
                time.sleep(0.15)

        if not ws_url:
            self.close()
            raise RuntimeError(f"Could not connect to Chrome CDP on port {self.port}")

        self.ws = CDPWebSocket(ws_url, timeout=self.timeout)
        self._running = True
        self.event_thread = threading.Thread(target=self._recv_loop, daemon=True)
        self.event_thread.start()

        # Enable necessary CDP domains
        self.send_command("Runtime.enable")
        self.send_command("Page.enable")
        self.send_command("DOM.enable")

    def _recv_loop(self):
        while self._running and self.ws:
            try:
                msg_text = self.ws.recv_text()
                if not msg_text:
                    continue
                msg = json.loads(msg_text)

                if "id" in msg:
                    mid = msg["id"]
                    with self._lock:
                        self._pending_responses[mid] = msg
                        if mid in self._resp_events:
                            self._resp_events[mid].set()
                elif "method" in msg:
                    method = msg["method"]
                    params = msg.get("params", {})
                    if method == "Runtime.consoleAPICalled":
                        c_type = params.get("type", "log")
                        args = params.get("args", [])
                        text_parts = [str(a.get("value", a.get("description", ""))) for a in args]
                        line = " ".join(text_parts)
                        self.console_logs.append({"type": c_type, "text": line})
                        if c_type in ("error", "assert"):
                            self.console_errors.append(line)
                    elif method == "Runtime.exceptionThrown":
                        details = params.get("exceptionDetails", {})
                        exc_text = details.get("text", "")
                        if "exception" in details:
                            exc_text += f": {details['exception'].get('description', '')}"
                        self.page_errors.append(exc_text)
            except Exception:
                if not self._running:
                    break
                time.sleep(0.05)

    def send_command(self, method: str, params: Optional[Dict[str, Any]] = None, timeout: float = 10.0) -> Dict[str, Any]:
        with self._lock:
            mid = self.msg_id
            self.msg_id += 1
            evt = threading.Event()
            self._resp_events[mid] = evt

        cmd = {"id": mid, "method": method, "params": params or {}}
        self.ws.send_text(json.dumps(cmd))

        if not evt.wait(timeout=timeout):
            raise TimeoutError(f"CDP command {method} timed out after {timeout}s")

        with self._lock:
            resp = self._pending_responses.pop(mid, {})
            self._resp_events.pop(mid, None)

        if "error" in resp:
            raise RuntimeError(f"CDP command {method} failed: {resp['error']}")
        return resp.get("result", {})

    def navigate(self, file_path_or_url: str):
        if not file_path_or_url.startswith("http://") and not file_path_or_url.startswith("https://") and not file_path_or_url.startswith("file://"):
            abs_path = os.path.abspath(file_path_or_url).replace("\\", "/")
            url = f"file:///{abs_path}"
        else:
            url = file_path_or_url

        self.send_command("Page.navigate", {"url": url})
        # Wait for page to finish loading and DOM ready
        time.sleep(0.8)
        self.wait_for_function("() => document.readyState === 'complete'", timeout=5.0)

    def evaluate(self, expression: str, timeout: float = 8.0) -> Any:
        res = self.send_command("Runtime.evaluate", {
            "expression": expression,
            "returnByValue": True,
            "awaitPromise": True,
        }, timeout=timeout)
        result_obj = res.get("result", {})
        if "exceptionDetails" in res:
            raise RuntimeError(f"JS Evaluation Error: {res['exceptionDetails']}")
        return result_obj.get("value")

    def wait_for_selector(self, selector: str, timeout: float = 5.0) -> bool:
        start = time.time()
        while time.time() - start < timeout:
            exists = self.evaluate(f"document.querySelector('{selector}') !== null")
            if exists:
                return True
            time.sleep(0.1)
        return False

    def wait_for_function(self, fn_expression: str, timeout: float = 5.0) -> bool:
        start = time.time()
        while time.time() - start < timeout:
            try:
                val = self.evaluate(f"Boolean(({fn_expression})())")
                if val:
                    return True
            except Exception:
                pass
            time.sleep(0.1)
        return False

    def click(self, selector: str):
        clicked = self.evaluate(f"""
            (() => {{
                const el = document.querySelector('{selector}');
                if (!el) return false;
                el.scrollIntoView();
                el.click();
                return true;
            }})()
        """)
        if not clicked:
            raise RuntimeError(f"Element '{selector}' not found to click")
        time.sleep(0.2)

    def get_text_content(self, selector: str) -> Optional[str]:
        return self.evaluate(f"""
            (() => {{
                const el = document.querySelector('{selector}');
                return el ? el.textContent.trim() : null;
            }})()
        """)

    def get_element_count(self, selector: str) -> int:
        return self.evaluate(f"document.querySelectorAll('{selector}').length") or 0

    def clear_errors(self):
        self.console_errors.clear()
        self.page_errors.clear()

    def close(self):
        self._running = False
        if self.ws:
            try:
                self.ws.close()
            except Exception:
                pass
            self.ws = None
        if self.process:
            try:
                self.process.terminate()
                self.process.wait(timeout=2.0)
            except Exception:
                try:
                    self.process.kill()
                except Exception:
                    pass
            self.process = None
        if self.temp_dir and os.path.exists(self.temp_dir):
            try:
                shutil.rmtree(self.temp_dir, ignore_errors=True)
            except Exception:
                pass
            self.temp_dir = None
