# Light up running code

## What is this?

A quick and dirty proof-of-concept of an idea I had – what if when you ran code, the relevant lines lit up in your text editor? And maybe those lines which ran the most lit up the brightest?

## Demo

![Screen recording](https://user-images.githubusercontent.com/1694410/82281107-82e14b80-995e-11ea-9229-ed5b7252a0a7.gif)

## How this works

The implementation here consists of a Ruby agent and a VS Code extension. The agent profiles running code and pings messages to a socket, which the extension listens for and surfaces in the editor.

## Run this yourself locally

1. Clone the repository
2. Run the build/watch script: `bin/build`
3. Open it in VS Code
4. Press F5 (or Run > Start Debugging)
5. Open the `agent` directory in this respository in the resulting VS Code window (labelled ‘Extension Development Host’)
6. Run the example script in the `agent` directory, `ruby example.rb`
7. Watch the lines of code light up as they run
