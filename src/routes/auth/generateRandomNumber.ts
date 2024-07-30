const random: string =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%7*";

function generateToken(length: number) {
  const len = random.length;
  let token: string = "";
  for (var i = 0; i < length; i++) {
    const pos = Math.random() * len;
    let str = random.charAt(pos);
    token = token.concat(str);
  }
  return token;
}
//console.log(generateToken(32));
export default generateToken ;
