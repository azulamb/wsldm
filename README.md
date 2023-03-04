# wsldm

WSL Distribution Manager.

wsldm is an interactive CLI.

## Example

```
PS > .\bin\wsldm.exe
No Name
 1 fedoraremix *
What next? [list(l)/replicate(r)/delete(d)/exit] [exit] r
Target no or name: 1
New distribution name: test
replicate: fedoraremix => test [y/N] y
Export fedoraremix ...
Import test ...
Start: wsl --distribution test
No Name
 1 fedoraremix *
 2 test
What next? [list(l)/replicate(r)/delete(d)/exit] [exit] d
Target no or name: 2  
Delete: test [y/N] y
Deleted!
No Name
 1 fedoraremix *
What next? [list(l)/replicate(r)/delete(d)/exit] [exit]
exit.
```

### Distribution files.

`%UserProfile%\WSL\`

## Info

wsldmはWSLのディストリビューションの追加と削除が面倒くさかったので対話型のCLIとして作ったものです。

一覧、複製、削除が可能です。

`%UserProfile%\WSL\` にファイルを作成しています。

## How to build

```sh
deno task build
```

## Other

このCLIはDenoのcompile機能を使ってexeファイルを作っています。

また実装周りの話は以下に書かれています。

https://zenn.dev/azulitenet/articles/creating_cli_in_deno
