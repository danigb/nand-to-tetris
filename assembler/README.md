# Assembler

“Before an assembly program can be executed on a computer, it must be translated into the computer’s binary machine language. The translation task is done by a program called the assembler. The assembler takes as input a stream of assembly commands and generates as output a stream of equivalent binary instructions. The resulting code can be loaded as is into the computer’s memory and executed by the hardware.”

[Read the commented source code]()

## Specification

“The A-instruction is used to set the A register to a 15-bit value”

“The C-instruction answers three questions: (a) what to compute, (b) where to store the computed value, and (c) what to do next? ”

“The **jump** field of the C-instruction tells the computer what to do next. There are two possibilities: The computer should either fetch and execute the next instruction in the program, which is the default, or it should fetch and execute an instruction located elsewhere in the program. In the latter case, we assume that **the A register has been previously set to the address to which we have to jump**.”


“The Hack ALU is designed to compute a fixed set of functions on the D, A, and M registers (where M stands for Memory[A])”
