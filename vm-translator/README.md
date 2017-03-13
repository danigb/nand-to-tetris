# VM Translator implementation in Javascript

This module provides the VM translator. It's equivalent to the chapters 7 and 8 of the book.


## Specification (summary)

- Arithmetic commands: perform arithmetic and logical operations on the stack.
  - Commands: `add`, `sub`, `neg`, `eq`, `gt`, `lt`, `and`, `or`, `not`
- Memory access commands: transfer data between the stack and virtual memory segments.
  - Commands: `push <segment> <index>`, `pop <segment> <index>`
  - Segments: argument, local, static, constant, this, that, pointer, temp
- Program flow commands: conditional and unconditional branching operations.
  - Commands: `label`, `goto`, `if-goto`, `function`, `call`, `return`
- Function calling commands: call functions and return from them.”

__The stack__

“The data value did not simply jump from one segment to another—it went through the stack. Yet in spite of its central role in the VM architecture, the stack proper is never mentioned in the VM language.”

__The heap__

“ Another memory element that exists in the VM’s background is the heap. The heap is the name of the RAM area dedicated for storing objects and arrays data. These objects and arrays can be manipulated by VM commands.”

## Program structure


“Parser: Handles the parsing of a single .vm file, and encapsulates access to the input code. It reads VM commands, parses them, and provides convenient access to their components. In addition, it removes all white space and comments.”

“CodeWriter: Translates VM commands into Hack assembly code.”


“Main Program The main program should construct a Parser to parse the VM input file and a CodeWriter to generate code into the corresponding output file. It should then march through the VM commands in the input file and generate assembly code for each one of them.”
