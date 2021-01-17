export let randomMotionFunc = () => {
    let data = {
        types: ['sin', 'cos'],
        operators: [{
            func: (a, b) => a + b,
            k: 0.5
        }, {
            func: (a, b) => a - b,
            k: 0.5
        }, {
            func: (a, b) => a * b,
            k: 1
        }],
        factorMin: 1.31,
        factorMax: 3.33
    }

    let getRandInt = (min, max) => {
        return Math.floor(min + Math.random() * (max + 1 - min))
    }

    let funcType1 = data.types[getRandInt(0, data.types.length - 1)]
    let funcType2 = data.types[getRandInt(0, data.types.length - 1)]
    let operator = data.operators[getRandInt(0, data.operators.length - 1)]
    let operatorFunc = operator.func
    let k = operator.k || 1
    let factor1 = Math.random() * (data.factorMax - data.factorMin) + data.factorMin
    let factor2 = Math.random() * (data.factorMax - data.factorMin) + data.factorMin

    return function(x) {
        return operatorFunc(Math[funcType1](factor1 * x), Math[funcType2](factor2 * x)) * k
    }
}