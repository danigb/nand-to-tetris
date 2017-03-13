# From NAND to Tetris

This pretends to be a complete implementation of the system described in [The Elements of Computer Systems](https://www.amazon.com/Elements-Computing-Systems-Building-Principles/dp/0262640686) and it's companion [coursera course](https://www.coursera.org/learn/build-a-computer/home/welcome)


#### Overview

- Your app written in Jack language (a collection of .jack files)
- Uses the services of the library/OS that is written in the Jack language too
- The Jack language files are translated to VM code using the the [Jack Compiler]() producing .vm files (Chapters 9 and 10)
- The VM code is translated to assembly code using the [vm-translator]() producing one .asm file (Chapters 7 and 9)
- The assembly code is converted to hack binary code using the [assembler]() producing .hack files (Chpater 6)
- Finally, the .hack binary code can be running in the using the [emulator]()


#### References

- The book: https://www.amazon.com/Elements-Computing-Systems-Building-Principles/dp/0262640686
- The course: https://www.coursera.org/learn/build-a-computer/home/welcome
- From NAND to tetris: http://nand2tetris.org/

Other repositories with solutions:

- https://github.com/itzhak-razi/From-Nand-to-Tetris
- https://github.com/unblevable/nand-to-tetris
