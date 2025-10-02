import random
import re


def evaluateToken(vars, token):
    def lookupVar(match):
        #print(match)
        name, = match.groups()
        #print('name', name)
        if name in vars:
            return vars[name]
        else:
            return "$" + name

    token = re.sub(r"\$([-_\w\d]+)", lookupVar, token)

    splits = token.split('//')
    if splits:
        token = splits[0].strip()

    def pickOption(match):
        bulk, = match.groups()
        options = bulk.split('|')
        if options:
            option = random.choice(options)
            return option
        return ''

    token = re.sub(r"\{([^{}]+)\}", pickOption, token)
    return token

def evaluateLine(vars, line):
    reg = r"^\$([-_\w\d]+)\s*(::|:)\s*(.*)" # <----------- "=<" has to come first because it's longer
    pairs = re.findall(reg, line)

    if pairs:
        for pair in pairs:
            name, operator, token = pair
            if operator == ':':
                vars[name] = token
            elif operator == '::':
                evaluated = evaluateToken(vars, token)
                vars[name] = evaluated
        return None
    else:
        return evaluateToken(vars, line)


def process(text):
    lines = text.splitlines()
    lines = [x.strip() for x in lines]
    vars = {}

    result = []
    for line in lines:
        evaluated = evaluateLine(vars, line)
        if evaluated is not None:
            result.append(evaluated)

    return "\n".join(result)

def run():
    input = '''
        $free : {red|green|blue}
        $free
        $free
        $fixed :: {red|green|blue}
        $fixed
        $fixed
    '''
    ouput = process(input)
    print('============================')
    print(ouput)

run()
