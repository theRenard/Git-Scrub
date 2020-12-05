# Git Scrub

# Task

Given a Github user name, use the Github API to extract statistics about what programming languages that users mostly codes with.

You need only consider the user's public repositories, and the number of lines for each language throughout all repositories. Your program should output the list of languages and the accumulated number of lines, sorted from most to least used.

You may use any language and submit your code via email or Gist. Don't hesitate to attach any relevant comment about difficulties you encountered and implementation choices.

The output should be:

```
$ ./preferred-languagues mefyl
Language repartition for mefyl
* 24754990: C++
* 3044348: Python
* 2409137: OCaml
* 2145359: C
...
```

# How to use

You can invoke the script with node with this command: `$ node preferred-languagues.js {git-username}` or `$ ./preferred-languagues {git-username}`.

⚠️ The binary is compiled for `macos-x64` you might need to recompile for your specific OS. If so then do a `$ npm run build`. 

Of course you need to have node.js installed on your machine.

