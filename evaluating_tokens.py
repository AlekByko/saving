import random
import re

#########################################################
### YOU MAY NOT BUILD/RETURN TEMPLATES IN EVALUATUION ###
### OR ELSE ALL HELLS COME LOOSE AND YOU ARE FUCKED   ###
#########################################################

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
    reg = r"^\$([-_\w\d]+)\s*(~later~|~now~)\s*(.*)" # <----------- "=<" has to come first because it's longer
    pairs = re.findall(reg, line)

    if pairs:
        for pair in pairs:
            name, operator, token = pair
            if operator == '~later~':
                vars[name] = token
            elif operator == '~now~':
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
        $a ~now~ {red|green|blue}
        $a
        $a
        $b ~later~ {red|green|blue}
        $b
        $b
    '''
    ouput = process(input)
    print(ouput)

run()
