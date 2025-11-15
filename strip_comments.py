def strip_slash_star_comments(text: str):

    at = 0
    while True:
        startAt = text.find("/*", at)
        if startAt < 0: break
        at = startAt + 2 # length of token

        endAt = text.find("*/", at)
        if endAt < 0: break
        endAt += 2 # length or token

        text = text[:startAt] + text[endAt:]
    return text

def strip_rest_line_comments(text: str, pattern: str):
    at = 0
    while True:
        start_at = text.find(pattern, at)
        if start_at < 0: return text
        at = start_at + len(pattern)

        end_at = text.find("\r\n", at)
        end_size = 2
        if end_at < 0:
            end_at = text.find("\n", at)
            end_size = 1
            if end_at < 0:
                return text[:start_at] # comment, but no line break

        before_text = text[:start_at]
        after_text = text[end_at:]
        text = before_text + after_text # <-- we want to preserve line ending chars so we don't skip them
        at = start_at + end_size

def strip_comments(text: str) -> str:
    text = strip_slash_star_comments(text)
    text = strip_rest_line_comments(text, '//')
    return text

def try_slash_star():
    raw = """a b c/*
    duck off
*/ d e
    """
    fixed = strip_slash_star_comments(raw)
    print(fixed)


def try_rest_line():
    text = """
// test
// another test
// yet another test
tester
test
"""
    text = strip_rest_line_comments(text, '//')
    print(text)

if __name__ == '__main__':
    try_slash_star()
    try_rest_line()
