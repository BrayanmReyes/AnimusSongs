async function testTranslate() {
    const res = await fetch("https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=es&dt=t&q=hello+world");
    const json = await res.json();
    console.log(json[0][0][0]);
}
testTranslate();
