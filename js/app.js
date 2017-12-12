/*
  YOUTUBE
~~~~~~~~~~~~~~~~~~~*/

var tag = document.createElement('script');

  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

  // 3. This function creates an <iframe> (and YouTube player)
  //    after the API code downloads.
  var player;
  function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
      height: '500',
      width: '900',
      videoId: 'sIlNIVXpIns',
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  }

  // 4. The API will call this function when the video player is ready.
  function onPlayerReady(event) {
    // event.target.playVideo();
    console.log('video ready')
    //add event listener for player
    Reveal.addEventListener('slidechanged', (event)=>{
      if(event.indexh == 1) player.playVideo()
      else player.stopVideo()
    })
  }

  // 5. The API calls this function when the player's state changes.
  //    The function indicates that when playing a video (state=1),
  //    the player should play for six seconds and then stop.
  var done = false;
  function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
      setTimeout(stopVideo, 6000);
      done = true;
    }
  }
  function stopVideo() {
    player.stopVideo();
  }


/*
      GRAPHS
~~~~~~~~~~~~~~~~~~~*/
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
let width = 600
five.attrs({
  width: width,
  height: h
})
draw()
let sim = d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(20))
            .force('collide', d3.forceCollide(d => d.r * 1.5 + 5))
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
                r: d => d.r * 1.5,
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


//MAP
let map = d3.select('#svg-6')
let mapw = 900
let maph = 500
let worldGroup, projection, path, graticule, startTime, endTime, timescale, quakeData, quakes;

d3.json("js/world-topo-min.json", (error, world) => {
  if(error) {
    throw new Error("Chrome has strict security permissions and won't allow you to fetch from a local file system. Use `http-server` to serve these files over HTTP to make the map visualization to work.")
    d3.select('.err').style('display', 'block')
  } else {
    d3.csv('js/1.0_month.csv', (error, quakes)=>{
      mapSetup(world)
      quakeData = quakes
      drawQuakes(quakes)
      initScale(quakes)
    })
  }
});

function initScale(quakeData){
  startTime = d3.min(quakeData, d => new Date(d.time).getTime() )
  endTime = d3.max(quakeData, d => new Date(d.time).getTime())
  timescale = d3.scaleLinear()
                    .domain([0,500])
                    .range([startTime, endTime])
  d3.select('#timeslider').on('input', (d) => {
    let val = parseInt(d3.event.target.value)
    console.log(val)
    if(val == 0){
      quakes.each((d,i,a) => {
        d3.select(a[i]).style('opacity', 1)
      })
    } else {
      let time = timescale(val)
      let timeMin = time - 12 * 60*60 * 1000
      let timeMax = time + 12 * 60*60 * 1000
      quakes.each((d, i, a)=>{
        let circ = d3.select(a[i])
        let quakeTime = new Date(d.time).getTime()
        if(quakeTime > timeMin && quakeTime < timeMax){
          circ.style('opacity',1)
        } else {
          circ.style('opacity',0)
        }
      })
    }
  })
}

function mapSetup(world){
    let latlonlines = map.append('g').attr('class','latlonlines')
  worldGroup = map.append('g').attr('class','world')
  graticule = d3.geoGraticule()
                .step([10,10])
  projection = d3.geoMercator()
      // .scale(mapw / 2 / Math.PI)
      // .translate([mapw / 1.8, maph / 2])
      // .scale(100)
  var countries = topojson.feature(world, world.objects.countries)
  colorScale.domain([0,countries.features.length]).range(['yellow','red'])
  path = d3.geoPath()
              .projection(projection);
  country = worldGroup.selectAll('.country')
          .data(countries.features)
          .enter()
          .append('path')
          .attrs({
            class: 'country',
            d: path,
            id: d => d.id,
            title: d => d.properties.name,
            fill: d => colorScale(d.id),
          })
          .on('mouseenter', (d)=>{
            d3.select(d3.event.target)
              .transition()
              .attr('fill','white')
          })
          .on('mouseleave', ()=>{
            d3.select(d3.event.target)
              .transition()
              .attr('fill',d => colorScale(d.id))
          })

  let grat = latlonlines.selectAll('path.graticule')
              .data([graticule()])
              .enter()
              .append('path')
              .attrs({
                'd': path,
                stroke: 'rgba(255,255,255,0.3)',
              })
}


function drawQuakes(quakeData){
  map.append('g').attr('class','quakes')
  let data = quakeData.filter(d => d.mag > 1.5)
  quakes = map.selectAll('.quakes')
            .data(data)
            .enter()
            .append('circle')
            .attrs({
              r: d => Math.abs(d.mag),
              fill: 'white',
              cx: d => projection([d.longitude, d.latitude,])[0],
              cy: d => projection([d.longitude, d.latitude])[1]
            })
}


//Line Graphs
let linew = 800
let lineh = 400
let buffer = 25
let linesvg = d3.select('#svg-7').attrs({
  width: linew, 
  height: lineh
})
let linedata = [0, 2, 4, 8, 16, 32, 64, 100, 100,  0, 0]
let lineXscale = d3.scaleLinear()
                  .domain([0, 10])
                  .range([buffer * 2, linew - buffer])
let lineYscale = d3.scaleLinear()
                  .domain([0, 100])
                  .range([lineh - buffer, buffer])

let linefunc = d3.line()
                .x((d,i)=> lineXscale(i))
                .y((d)=> lineYscale(d))
                .curve(d3.curveCatmullRom.alpha(0.2));

linesvg.append('path')
                  .datum(linedata)
                  .attrs({
                    stroke: 'url(#gradient2)',
                    d: linefunc,
                    'stroke-width': 5,
                    fill: 'none'
                  })

//axis
linesvg.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(lineYscale))
    .attrs({
      transform: `translate(${buffer})`,
      stroke: 'white'
    })
.append('text')
    .attrs({
      transform: `rotate(-90)`,
      fill: 'white',
      x: -1 * buffer,
      y: buffer /2,
      'font-weight': 100,
      stroke: 'none',
    }).text('Embarrassment')

linesvg.append('g')
    .attr('class', 'x-axis')
    .call(d3.axisBottom(lineXscale))
    .attrs({
      transform: `translate(0, ${lineh - buffer})`,
      stroke: 'white'
    }).append('text')
    .attrs({
      transform: `translate(${buffer * 4.5} -${buffer})`,
      fill: 'white',
      x: -1 * buffer,
      y: buffer /2,
      'font-weight': 100,
      stroke: 'none',
    }).text('Loudness')


