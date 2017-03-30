let svgs = d3.selectAll('svg')
let h = 500
svgs.attrs({
  width: '100%',
  height: h,
})

//one
var one = d3.select('#svg-1')
let circle = one.append('circle').attrs({
                r: 100,
                fill: 'yellow',
                cx: '50%',
                cy: '50%',
              })
              .datum({d3: 'cool'})
           // .data([{d3: 'cool'}]) // <= THIS WORKS TOO
              .on('click', (d)=>{
                console.log(d)
              })


//two
let two = d3.select('#svg-2')
let maxSize = 20
let numBubbles = 50
let colorMultiple = Math.floor(255 / numBubbles)

let data = d3.range(0,numBubbles,1).map( (d) => {
  return {
    r: Math.round(Math.random() * maxSize)
  }
})
//data ex: => [{ r: 13}, ...]
let value = two.append('text').text('0').attrs({
  'class':'value',
  'fill': 'white',
  'font-size': 100,
  'x': '10%',
  'y': '30%',
})

let group = two.append('g').attr('class','bubble-group')
group.selectAll('.bubbles')
          .data(data)
          .enter()
          .append('circle')
          .attrs({
            r: d => d.r,
            fill: (d,i) => `hsla(${colorMultiple * i}, 50%, 50%, 1)`,
            cx: (d,i) => (maxSize + 2) * i ,
            cy: '50%'
          }).on('mouseenter', (d)=>{
            value.text(d.r)
          })
