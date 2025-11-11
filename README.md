# DDice

```
Small program to roll dice, or generates tables and graphs with probability functions.

Usage: main [options] [string]

Arguments:
  string               Dice to roll (default: "1d20")

Options:
  --save-table         Generate save table
  --pdf                Compute and graph probability distribution function for specified dice
  --many-pdf           Print all pdf functions for 1 to 10 dice.
  --out-file <string>  File to write graphics to.
  -h, --help           display help for command

Examples:
  ddice                               Roll 1d20                                                                      
  ddice 8d6                           Roll 8d6                                                                       
  ddice --save-table                  Print probability tables for making a saving throw.                            
  ddice 4d4 --pdf                     Print probability distribution funrtion for 4d4.                               
  ddice 4d4 --pdf --out-file out.png  Compute probability distribution function for 4d4 and write them to a PNG file.
```
