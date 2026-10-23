```python
import re

def is_palindrome(s: str) -> bool:
    cleaned = re.sub(r"[^a-z0-9]", "", s.lower())
    return cleaned == cleaned[::-1]

def is_palindrome_two_pointers(s: str) -> bool:
    i, j = 0, len(s) - 1
    while i < j:
        if not s[i].isalnum():
            i += 1
        elif not s[j].isalnum():
            j -= 1
        elif s[i].lower() != s[j].lower():
            return False
        else:
            i += 1
            j -= 1
    return True

print(is_palindrome("A man, a plan, a canal: Panama"))   # True
print(is_palindrome_two_pointers("race a car"))          # False
```

**Why it works:** `[::-1]` reverses a string via slicing; a palindrome equals its reverse.

**Complexity**

- Slicing version: O(n) time, O(n) space (cleaned copy and reversed copy).
- Two-pointer version: O(n) time, O(1) extra space.

**Edge cases:** empty string (True), single character (True), unicode (consider `str.casefold()` and `unicodedata.normalize`).
