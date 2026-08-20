"""ANSI color formatting for terminal test output."""
import os
import sys

# Enable ANSI colors on Windows terminal if needed
if os.name == 'nt':
    os.system('')

class Colors:
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    ITALIC = '\033[3m'
    UNDERLINE = '\033[4m'
    
    # Foreground
    BLACK = '\033[30m'
    RED = '\033[31m'
    GREEN = '\033[32m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    MAGENTA = '\033[35m'
    CYAN = '\033[36m'
    WHITE = '\033[37m'
    
    # Bright Foreground
    BRIGHT_BLACK = '\033[90m'
    BRIGHT_RED = '\033[91m'
    BRIGHT_GREEN = '\033[92m'
    BRIGHT_YELLOW = '\033[93m'
    BRIGHT_BLUE = '\033[94m'
    BRIGHT_MAGENTA = '\033[95m'
    BRIGHT_CYAN = '\033[96m'
    BRIGHT_WHITE = '\033[97m'
    
    # Background
    BG_BLACK = '\033[40m'
    BG_RED = '\033[41m'
    BG_GREEN = '\033[42m'
    BG_YELLOW = '\033[43m'
    BG_BLUE = '\033[44m'
    BG_MAGENTA = '\033[45m'
    BG_CYAN = '\033[46m'
    BG_WHITE = '\033[47m'

def colored(text: str, color: str, bold: bool = False) -> str:
    prefix = f"{Colors.BOLD if bold else ''}{color}"
    return f"{prefix}{text}{Colors.RESET}"

def c_pass(text: str = "PASS") -> str:
    return f"{Colors.BG_GREEN}{Colors.BLACK}{Colors.BOLD} {text} {Colors.RESET}"

def c_fail(text: str = "FAIL") -> str:
    return f"{Colors.BG_RED}{Colors.WHITE}{Colors.BOLD} {text} {Colors.RESET}"

def c_skip(text: str = "SKIP") -> str:
    return f"{Colors.BG_YELLOW}{Colors.BLACK}{Colors.BOLD} {text} {Colors.RESET}"

def c_cyan(text: str) -> str:
    return f"{Colors.BRIGHT_CYAN}{text}{Colors.RESET}"

def c_green(text: str) -> str:
    return f"{Colors.BRIGHT_GREEN}{text}{Colors.RESET}"

def c_red(text: str) -> str:
    return f"{Colors.BRIGHT_RED}{text}{Colors.RESET}"

def c_yellow(text: str) -> str:
    return f"{Colors.BRIGHT_YELLOW}{text}{Colors.RESET}"

def c_dim(text: str) -> str:
    return f"{Colors.DIM}{text}{Colors.RESET}"

def c_bold(text: str) -> str:
    return f"{Colors.BOLD}{text}{Colors.RESET}"
