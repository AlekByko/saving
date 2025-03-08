import argparse

from transformers import CLIPTokenizer

parser = argparse.ArgumentParser()
parser.add_argument("--text", type=str)
args = parser.parse_args()
# Load the SD 1.5 tokenizer
tokenizer = CLIPTokenizer.from_pretrained("openai/clip-vit-large-patch14")

# Tokenize
tokens = tokenizer.tokenize(args.text)

print(tokens)
