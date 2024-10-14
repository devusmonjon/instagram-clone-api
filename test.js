const unlilar = ["a", "e", "i", "o", "u"];

function getCount(str) {
    let count = 0;
    const is_aviable = [];
    str.split("").forEach(letter => {
        unlilar.forEach(unli => {
            if (unli === letter) {
                //         if (!is_aviable.includes(unli)) {
                count++;
                is_aviable.push(unli)
                //         }
            }
        })
    })
    return count;
}

console.log(getCount("abracadabra"))