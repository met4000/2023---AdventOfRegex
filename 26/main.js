// func to make RegExp powerful enough;
// repeatedly apply a replacement until the string stops changing
String.prototype.repeatReplace = function (f) {
  let lastStr = this, str = f(lastStr);
  while (lastStr != str) {
    lastStr = str;
    str = f(str);
  }
  return str;
};

// helper func that creates multiple replacements
// by iterating over the array provided
String.prototype.replaceTemplate = function (searchTemplate, replaceTemplate, arr) {
  let searchFunc = searchTemplate, replaceFunc = replaceTemplate;
  if (typeof searchTemplate !== "function") searchFunc = _ => String(searchTemplate);
  if (typeof replaceTemplate !== "function") replaceFunc = _ => String(replaceTemplate);

  let str = this;
  for (let v of arr) str = str.replace(searchFunc(v), replaceFunc(v));
  return str;
}

// string literal tag for making templates for `.replaceTemplate`
// makes a lambda from the literal string an lambdas provided
function template(strings, ...lambdas) {
  return (...args) => {
    let str = strings.raw[0];

    for (let i in lambdas) {
      let lambda = lambdas[i];
      if (typeof lambda !== "function") lambda = _ => lambdas[i];

      i = parseInt(i);
      str += lambda(...args);
      str += strings.raw[i + 1];
    }

    return str;
  }
}

// like the `template` tag, but makes a regex
function templateRegExp(string, ...lambdas) {
  return function (...args) {
    let [_, pattern, flags] = /^\/(.*)\/(\w*)$/.exec(template(string, ...lambdas)(...args));
    return new RegExp(pattern, flags);
  };
}

// range (inclusive)
function range(a, b, delta = 1) {
  return Array.from({ length: Math.abs(b - a) / Math.abs(delta) + 1 }).map((_, i) => a + i * delta * Math.sign(b - a));
}



let str = `８｜♜♞♝♛♚♝♞♜
７｜♟︎♟︎♟︎♟︎♟︎♟︎♟︎♟︎
６｜　　　　　　　　
５｜　　　　　　　　
４｜　　　　　　　　
３｜　　　　　　　　
２｜♙♙♙♙♙♙♙♙
１｜♖♘♗♕♔♗♘♖
ー＋ーーーーーーーー
　｜ａｂｃｄｅｆｇｈ

[Result "*"]

1. *`;

//document.body.innerText =
str
// main program is below:



// generate moves

.replace(/$/, "\n\nPossible Moves:")

// add a marker to the first piece
.replace(/[♔-♙]/, "！$&")

// iterate through pieces, checking their moves
.repeatReplace(v => v
  // TODO add support for deliberately missing directions (e.g. for black downwards moving pawns)
  // `$`; orthogonal move(s) or capture(s) - directions start up and go clockwise
  // `%`; diagonal move(s) or capture(s) - directions start up-left and go clockwise
  // `|`; orthogonal move(s)
  // `_`; diagonal capture(s)
  // `<`; knight move(s) - up left
  // `>`; knight move(s) - up right
  // repeated tokens; up to and including that many moves of that type
  // star; the number of directions/angles to move in
  // comma after move info

  // move types must be in the same order as above

  // piece movement
  // doesn't know about pawn promotion or en-passant
  // TODO check piece is on board
  // TODO change pawns from $ and % to ^ and _
  // .replace(/i♙(.*\n.*\n-)/, "$$$$*,%**,♙!$1") // starting rank
  // .replace(/i♙/, "$$*,%**,♙!")
  // .replace(/i♗/, "%%%%%%%%****,♗!")
  // .replace(/i♘/, "<****,>****,♘!")
  // .replace(/i♖/, "%%%%%%%%****,♖!")
  // .replace(/i♕/, "$$$$$$$$$$$$$$$$****,%%%%%%%%****,♕!")
  // .replace(/i♔/, "$$****,%****,♔!")
  
  // ! only pawn forward moves and knight moves for now
  .replace(/！♙(.*\n.*\nー)/, "||*,♙!$1") // starting rank
  .replace(/！♙/, "|*,♙!")
  .replace(/！♘/, "<****,>****,♘!")
  .replace(/！([♔-♙])/, "$1!")

  // uses a @ to mark where the previous check was (and & after moving the check)

  // orthogonal movement ($)
  .repeatReplace(v => v
    .replace(/([$|]+)(\*|\*{4}),/, "@`$1$2,")
    // TODO other directions

    .repeatReplace(v => v
      // increment distance by 1
      .replace(/([$|])(\*+)/, "$2$1")

      // if unoccupied, add marker
      .replace(/([１-８])(｜(?:[♔-♞　]|♟︎)*)(　)((?:[♔-♞　\n１-８｜]|♟︎){10})@((?:(?:[♔-♞　\n１-８｜]|♟︎){10}(?:(?:[♔-♞　\n１-８｜]|♟︎){11})*)?[^\n]*([^\n])!(?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2&$4　$5$7$8\n$6 ~$7$1") // up
      // TODO right, down, left
      
      // TODO capture only enemy pieces
      // if not unoccupied, 
      .replace(/([１-８])(｜(?:[♔-♞　]|♟︎)*)([♚-♞]|♟︎)((?:[♔-♞　\n１-８｜]|♟︎){10})@((?:(?:[♔-♞　\n１-８｜]|♟︎){10}(?:(?:[♔-♞　\n１-８｜]|♟︎){11})*)?[^\n]*([^\n])!(?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2&$4　$5$7$8\n$6 ~x$7$1 (-$3)") // up
      // TODO other directions

      // remove initial preceding/trailing space
      .replace(/　?`　?/, "")
      .replace(/&/, "@")

      // TODO deal with final movement in a direction, and changing direction
      .replace(/@([^$|]+)\*(\**[$|]+),/, "　$1$2,") // remove marker and change to next direction
      .replace(/([^*])[$|]+,/, "$1") // remove move types with all directions completed
    )
  )


  // knight movement (<, >)
  
  // <

  // ****
  .replace(/(<\*{4},[^\n]*([^\n])!(?=.{0,8}\n([１-８]))(?:[♔-♞　\n１-８｜]|♟︎){8})(　)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~$6$3")
  .replace(/(<\*{4},[^\n]*([^\n])!(?=.{0,8}\n([１-８]))(?:[♔-♞　\n１-８｜]|♟︎){8})([♚-♞]|♟︎)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~x$6$3 (-$4)")
  .replace(/(<\*{3})\*(,[^\n]+!)/, "$1$2")

  // ***
  .replace(/(<\*{3},[^\n]*([^\n])!(?=.{11,19}\n([１-８]))(?:[♔-♞　\n１-８｜]|♟︎){22})(　)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~$6$3")
  .replace(/(<\*{3},[^\n]*([^\n])!(?=.{11,19}\n([１-８]))(?:[♔-♞　\n１-８｜]|♟︎){22})([♚-♞]|♟︎)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~x$6$3 (-$4)")
  .replace(/(<\*{2})\*(,[^\n]+!)/, "$1$2")

  // **
  .replace(/([１-８])(｜(?:[♔-♞　]|♟︎)*)(　)((?:[♔-♞　\n１-８｜]|♟︎){8}<\*{2},[^\n]*([^\n])!)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{23})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1")
  .replace(/([１-８])(｜(?:[♔-♞　]|♟︎)*)([♚-♞]|♟︎)((?:[♔-♞　\n１-８｜]|♟︎){8}<\*{2},[^\n]*([^\n])!)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{23})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~x$7$1 (-$3)")
  .replace(/(<\*)\*(,[^\n]+!)/, "$1$2")
  
  // *
  .replace(/([１-８])(｜(?:[♔-♞　]|♟︎)*)(　)((?:[♔-♞　\n１-８｜]|♟︎){22}<\*,[^\n]*([^\n])!)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{20})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1")
  .replace(/([１-８])(｜(?:[♔-♞　]|♟︎)*)([♚-♞]|♟︎)((?:[♔-♞　\n１-８｜]|♟︎){22}<\*,[^\n]*([^\n])!)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{20})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~x$7$1 (-$3)")
  .replace(/<\*,([^\n]+!)/, "$1")
  
  // >

  // ****
  .replace(/([１-８])(｜(?:[♔-♞　]|♟︎)*)(　)((?:[♔-♞　\n１-８｜]|♟︎){12}>\*{4},[^\n]*([^\n])!)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{19})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1")
  .replace(/([１-８])(｜(?:[♔-♞　]|♟︎)*)([♚-♞]|♟︎)((?:[♔-♞　\n１-８｜]|♟︎){12}>\*{4},[^\n]*([^\n])!)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{19})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~x$7$1 (-$3)")
  .replace(/(>\*{3})\*(,[^\n]+!)/, "$1$2")
  
  // ***
  .replace(/(>\*{3},[^\n]*([^\n])!(?=.{9,17}\n([１-８]))(?:[♔-♞　\n１-８｜]|♟︎){20})(　)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~$6$3")
  .replace(/(>\*{3},[^\n]*([^\n])!(?=.{9,17}\n([１-８]))(?:[♔-♞　\n１-８｜]|♟︎){20})([♚-♞]|♟︎)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~x$6$3 (-$4)")
  .replace(/(>\*{2})\*(,[^\n]+!)/, "$1$2")
  
  // **
  .replace(/(>\*{2},[^\n]*([^\n])!(?=.{0,12}\n([１-８]))(?:[♔-♞　\n１-８｜]|♟︎){12})(　)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~$6$3")
  .replace(/(>\*{2},[^\n]*([^\n])!(?=.{0,12}\n([１-８]))(?:[♔-♞　\n１-８｜]|♟︎){12})([♚-♞]|♟︎)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*Possible Moves:)/s, "$1$4$5$6$7\n$2 ~x$6$3 (-$4)")
  .replace(/(>\*)\*(,[^\n]+!)/, "$1$2")
  
  // *
  .replace(/([１-８])(｜(?:[♔-♞　]|♟︎)*)(　)((?:[♔-♞　\n１-８｜]|♟︎){20}>\*,[^\n]*([^\n])!)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{22})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~$7$1")
  .replace(/([１-８])(｜(?:[♔-♞　]|♟︎)*)([♚-♞]|♟︎)((?:[♔-♞　\n１-８｜]|♟︎){20}>\*,[^\n]*([^\n])!)((?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{22})([ａ-ｈ])(.*Possible Moves:)/s, "$1$2$3$4$6$7$8\n$5 ~x$7$1 (-$3)")
  .replace(/>\*,([^\n]+!)/, "$1")


  // add current coord to current moves
  .repeatReplace(v => v
    .replace(/([１-８])(｜(?:[♔-♞　]|♟︎)*(?:[♔-♞　]|♟︎)!(?:(?:[♔-♞　\n１-８｜]|♟︎){11})*.{21})([ａ-ｈ])(.*)~/s, "$1$2$3$4$3$1")
  )

  .replace(/(!)(\n[１-８]｜)/, "$2$1")
  .replace(/!/, "！")
)

.replace(/！/, "")

// TODO sort moves

// TODO select move