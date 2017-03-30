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

//three
let three = d3.select('#svg-3')
three.attr('height', 50)
let colorScale = d3.scaleLinear()
                    .domain([0, numBubbles])
                    .range(['red', 'blue'])

var g = three.append('g').attr('class','bubble-group')
g.selectAll('.bubbles')
          .data(data)
          .enter()
          .append('circle')
          .attrs({
            r: 10,
            fill: (d,i) => colorScale(i),
            cx: (d,i) => (maxSize + 2) * i ,
            cy: '50%'
          })

//four
let four = d3.select('#svg-4')
four.attr('height', 100)

let nodes = four.selectAll('.bubbles')
            .data(data)
            .enter()
            .append('circle')
            .attrs({
              r: 10,
              fill: (d,i) => colorScale(i),
              cx: (d,i) => (maxSize + 2) * i ,
              cy: '50%'
            })
let dir = 1
function step(){
  setTimeout(()=>{
    window.requestAnimationFrame(()=>{
      nodes.transition()
      .duration(1000)
      .delay((d,i) => 50 * i)
      .attr('cy', () => dir ? '90%' : '10%')
      dir ^= 1
      step()
    })
  }, 1000)
}
step()

//five

var nodes2;
let five = d3.select('#svg-5')
let width = 400
five.attrs({
  width: width,
  height: h
})
draw()
let sim = d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(5))
            .force('collide', d3.forceCollide(d => d.r + 5))
            .force("center", d3.forceCenter(width / 2, h / 2))
            .nodes(data)  // <= important


sim.on('tick', tick)

// FUNCTIONS
function tick(){
  nodes2.attrs({
    cx: d => d.x,
    cy: d => d.y
  })
}

function draw(){
  nodes2 = five.selectAll('.node')
              .data(data).enter().append('circle').attrs({
                r: d => d.r,
                fill: (d,i) => colorScale(i),
                x: d => Math.random() * width,
                y: d => Math.random() * h,
              })
              .call(d3.drag()
                      .on("start", dragstarted)
                      .on("drag", dragged)
                      .on("end", dragended))
}

// NODE DRAG LISTENERS
function dragstarted(d) {
  if (!d3.event.active) sim.alphaTarget(0.3).restart();
  d.x = d.x;
  d.y = d.y;
}
function dragged(d) {
  d.x = d3.event.x;
  d.y = d3.event.y;
}
function dragended(d) {
  if (!d3.event.active) sim.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
