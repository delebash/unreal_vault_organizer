"""
Basic skeleton of a mitmproxy addon.

Run as follows: mitmproxy -s anatomy.py
"""

from mitmproxy import ctx
import pyperclip
import sys


def response(flow):
    if "friends-public" in flow.request.host_header:
        auth_token = flow.request.headers["Authorization"]
        url = flow.request.url
        full = auth_token + "," + url
        pyperclip.copy(full)
        sys.exit()
