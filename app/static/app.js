const $ = (q) => document.querySelector(q)
const $$ = (q) => Array.from(document.querySelectorAll(q))

const state = {
  A: { rows: 2, cols: 2, values: [['0','0'],['0','0']] },
  B: { rows: 2, cols: 2, values: [['0','0'],['0','0']] },
  R: { rows: 0, cols: 0, values: [] },
  lin: { n: 2, A: [['0','0'],['0','0']], b: ['0','0'] },
  vec: { mode: 'polar', u: {mag:'1',deg:'0'}, v:{mag:'1',deg:'90'}, show:{parallelogram:true, subtraction:false} }
}

function buildMatrix(container, key){
  const m = state[key]
  container.innerHTML = ''
  container.style.gridTemplateColumns = `repeat(${m.cols}, 56px)`
  for(let i=0;i<m.rows;i++){
    for(let j=0;j<m.cols;j++){
      const wrap = document.createElement('div')
      wrap.style.display = 'flex'
      wrap.style.alignItems = 'center'
      const input = document.createElement('input')
      input.value = (m.values[i] && m.values[i][j]) || '0'
      input.addEventListener('input',()=>{
        m.values[i][j] = input.value
        renderFractionPreview(wrap, input.value)
      })
      wrap.appendChild(input)
      renderFractionPreview(wrap, input.value)
      container.appendChild(wrap)
    }
  }
}

function renderFractionPreview(wrap, value){
  const old = wrap.querySelector('.frac')
  if(old) old.remove()
  if(typeof value === 'string' && value.includes('/')){
    const parts = value.split('/')
    if(parts.length===2){
      const frac = document.createElement('div')
      frac.className = 'frac'
      const num = document.createElement('div')
      num.className = 'num'
      num.textContent = parts[0].trim()
      const den = document.createElement('div')
      den.className = 'den'
      den.textContent = parts[1].trim()
      frac.appendChild(num)
      frac.appendChild(den)
      wrap.appendChild(frac)
    }
  }
}

function resizeMatrix(key, dRows, dCols){
  const m = state[key]
  m.rows = Math.max(1, m.rows + (dRows||0))
  m.cols = Math.max(1, m.cols + (dCols||0))
  const newVals = []
  for(let i=0;i<m.rows;i++){
    newVals[i] = []
    for(let j=0;j<m.cols;j++){
      newVals[i][j] = (m.values[i] && m.values[i][j]) || '0'
    }
  }
  m.values = newVals
}

function buildVector(container, key){
  const isPolar = state.vec.mode==='polar'
  container.innerHTML = ''
  if(isPolar){
    const mag = document.createElement('input'); mag.value = state.vec[key].mag
    const deg = document.createElement('input'); deg.value = state.vec[key].deg
    mag.addEventListener('input', ()=> state.vec[key].mag = mag.value)
    deg.addEventListener('input', ()=> state.vec[key].deg = deg.value)
    container.appendChild(mag); container.appendChild(deg)
  } else {
    const x = document.createElement('input'); x.value = state.vec[key].x||'0'
    const y = document.createElement('input'); y.value = state.vec[key].y||'0'
    x.addEventListener('input', ()=> state.vec[key].x = x.value)
    y.addEventListener('input', ()=> state.vec[key].y = y.value)
    container.appendChild(x); container.appendChild(y)
  }
}

function renderAll(){
  buildMatrix($('#matrixA'), 'A')
  buildMatrix($('#matrixB'), 'B')
  if(state.R.rows>0) buildMatrix($('#matrixR'), 'R')
  buildLin()
  buildVector($('#u-inputs'), 'u')
  buildVector($('#v-inputs'), 'v')
}

function buildLin(){
  const n = state.lin.n
  const A = state.lin.A
  const b = state.lin.b
  const linA = $('#linA')
  linA.innerHTML = ''
  linA.style.gridTemplateColumns = `repeat(${n}, 56px)`
  for(let i=0;i<n;i++){
    for(let j=0;j<n;j++){
      const input = document.createElement('input')
      input.value = (A[i] && A[i][j]) || '0'
      input.addEventListener('input', ()=>{ A[i][j] = input.value })
      linA.appendChild(input)
    }
  }
  const linB = $('#linB')
  linB.innerHTML = ''
  for(let i=0;i<n;i++){
    const input = document.createElement('input')
    input.value = b[i] || '0'
    input.addEventListener('input', ()=>{ b[i] = input.value })
    linB.appendChild(input)
  }
}

function addLinSize(){
  const n = state.lin.n + 1
  const A = Array.from({length:n}, (_,i)=> Array.from({length:n}, (_,j)=> (state.lin.A[i]&&state.lin.A[i][j])||'0'))
  const b = Array.from({length:n}, (_,i)=> state.lin.b[i] || '0')
  state.lin = { n, A, b }
}

function delLinSize(){
  if(state.lin.n <= 2){ return }
  const n = state.lin.n - 1
  const A = Array.from({length:n}, (_,i)=> Array.from({length:n}, (_,j)=> (state.lin.A[i]&&state.lin.A[i][j])||'0'))
  const b = Array.from({length:n}, (_,i)=> state.lin.b[i] || '0')
  state.lin = { n, A, b }
}

async function postJSON(url, body){
  const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
  const data = await res.json()
  if(!res.ok){ throw new Error(data.detail || 'Error') }
  return data
}

function tabSwitch(){
  $$('.tab').forEach(btn=> btn.addEventListener('click', ()=>{
    $$('.tab').forEach(b=> b.classList.remove('active'))
    btn.classList.add('active')
    const t = btn.dataset.tab
    $$('.panel').forEach(p=> p.classList.remove('active'))
    $('#'+t).classList.add('active')
  }))
}

function setupMatrixControls(){
  $('#a-add-col').onclick = ()=>{ resizeMatrix('A',0,1); renderAll() }
  $('#a-del-col').onclick = ()=>{ resizeMatrix('A',0,-1); renderAll() }
  $('#a-add-row').onclick = ()=>{ resizeMatrix('A',1,0); renderAll() }
  $('#a-del-row').onclick = ()=>{ resizeMatrix('A',-1,0); renderAll() }
  $('#b-add-col').onclick = ()=>{ resizeMatrix('B',0,1); renderAll() }
  $('#b-del-col').onclick = ()=>{ resizeMatrix('B',0,-1); renderAll() }
  $('#b-add-row').onclick = ()=>{ resizeMatrix('B',1,0); renderAll() }
  $('#b-del-row').onclick = ()=>{ resizeMatrix('B',-1,0); renderAll() }

  $('#run-bin').onclick = async ()=>{
    $('#matrix-error').textContent = ''
    $('#scalarR').textContent = ''
    try{
      const data = await postJSON('/api/matrix/operate', { A: state.A.values, B: state.B.values, op: $('#op-bin').value })
      state.R.values = data.resultMatrix
      state.R.rows = data.resultMatrix.length
      state.R.cols = data.resultMatrix[0]?.length || 0
      renderAll()
    }catch(e){ $('#matrix-error').textContent = e.message }
  }
  $('#run-uni').onclick = async ()=>{
    $('#matrix-error').textContent = ''
    $('#scalarR').textContent = ''
    try{
      const payload = { A: state.A.values, B: state.B.values, op: $('#op-uni').value, target: $('#op-uni-target').value }
      const data = await postJSON('/api/matrix/operate', payload)
      if(data.resultMatrix){
        state.R.values = data.resultMatrix
        state.R.rows = data.resultMatrix.length
        state.R.cols = data.resultMatrix[0]?.length || 0
        renderAll()
      }
      if(typeof data.scalar !== 'undefined'){
        $('#scalarR').textContent = `Resultado: ${Number(data.scalar).toFixed(6)}`
      }
    }catch(e){ $('#matrix-error').textContent = e.message }
  }
}

function setupLinear(){
  $('#lin-add-size').onclick = ()=>{ addLinSize(); renderAll() }
  $('#lin-del-size').onclick = ()=>{ delLinSize(); renderAll() }
  $('#solve-cramer').onclick = async ()=>{
    $('#lin-error').textContent = ''
    document.getElementById('lin-det').textContent = ''
    document.getElementById('lin-ax').innerHTML = ''
    document.getElementById('lin-solution').textContent = ''
    try{
      const data = await postJSON('/api/linear/cramer', { A: state.lin.A, b: state.lin.b })
      const det = document.getElementById('lin-det')
      det.textContent = `|A| = ${Number(data.detA).toFixed(6)}`
      const ax = document.getElementById('lin-ax')
      ax.innerHTML = ''

      // Pintar matriz A original
      appendMatrix(ax, 'A', state.lin.A, `|A| = ${Number(data.detA).toFixed(6)}`)

      // Pintar A1..An con determinantes, ordenados por índice
      if(data.matrices){
        const entries = Object.entries(data.matrices)
          .map(([k,m])=>({ key:k, mat:m, idx: parseInt(String(k).replace(/[^0-9]/g,'')||'0',10)-1 }))
          .filter(e=> e.idx>=0)
          .sort((a,b)=> a.idx-b.idx)
        entries.forEach((e)=>{
          const label = `A${e.idx+1}`
          const detv = Array.isArray(data.dets) && typeof data.dets[e.idx] !== 'undefined' ? Number(data.dets[e.idx]).toFixed(6) : ''
          appendMatrix(ax, label, e.mat, detv?`|${label}| = ${detv}`:undefined)
        })
      }
      const sol = document.getElementById('lin-solution')
      if(data.solution){
        sol.textContent = `Solución: ${data.solution.map(v=>Number(v).toFixed(6)).join(', ')}`
      } else if(data.error){
        sol.textContent = ''
        $('#lin-error').textContent = data.error
      }
    }catch(e){ $('#lin-error').textContent = e.message }
  }
  $('#solve-inv').onclick = async ()=>{
    $('#lin-error').textContent = ''
    document.getElementById('lin-det').textContent = ''
    document.getElementById('lin-ax').innerHTML = ''
    document.getElementById('lin-solution').textContent = ''
    try{
      const data = await postJSON('/api/linear/inverse', { A: state.lin.A, b: state.lin.b })
      const det = document.getElementById('lin-det')
      det.textContent = `|A| = ${Number(data.detA).toFixed(6)}`
      const ax = document.getElementById('lin-ax')
      ax.innerHTML = ''
      // Mostrar A y A^{-1} si aplica
      appendMatrix(ax, 'A', state.lin.A, `|A| = ${Number(data.detA).toFixed(6)}`)
      if(data.Ainv){
        appendMatrix(ax, 'A⁻¹', data.Ainv)
      }
      const sol = document.getElementById('lin-solution')
      if(data.solution){
        sol.textContent = `Solución: ${data.solution.map(v=>Number(v).toFixed(6)).join(', ')}`
      } else if(data.error){
        sol.textContent = ''
        $('#lin-error').textContent = data.error
      }
    }catch(e){ $('#lin-error').textContent = e.message }
  }
}

function appendMatrix(parent, title, mat, subtitle){
  const wrap = document.createElement('div')
  const ttl = document.createElement('div'); ttl.className='matrix-title'; ttl.textContent=title
  wrap.appendChild(ttl)
  const grid = document.createElement('div'); grid.className='matrix'
  if(Array.isArray(mat) && mat.length>0){
    const rows = mat.length
    const cols = mat[0].length
    grid.style.gridTemplateColumns = `repeat(${cols}, 56px)`
    for(let i=0;i<rows;i++){
      for(let j=0;j<cols;j++){
        const input = document.createElement('input')
        input.value = String(mat[i][j])
        input.disabled = true
        grid.appendChild(input)
      }
    }
  }
  wrap.appendChild(grid)
  if(subtitle){
    const st = document.createElement('div')
    st.style.marginTop = '4px'
    st.textContent = subtitle
    wrap.appendChild(st)
  }
  parent.appendChild(wrap)
}

async function updateVectorPlot() {
  try {
    // Validate vector inputs
    if (!state.vec.u || !state.vec.v) {
      throw new Error('Vectores no configurados correctamente')
    }
    
    // Validate input mode and vector data
    if (state.vec.mode === 'polar') {
      if (!state.vec.u.mag || !state.vec.u.deg || !state.vec.v.mag || !state.vec.v.deg) {
        throw new Error('Datos polares incompletos')
      }
      // Validate numeric values
      const uMag = parseFloat(state.vec.u.mag)
      const uDeg = parseFloat(state.vec.u.deg)
      const vMag = parseFloat(state.vec.v.mag)
      const vDeg = parseFloat(state.vec.v.deg)
      
      if (isNaN(uMag) || isNaN(uDeg) || isNaN(vMag) || isNaN(vDeg)) {
        throw new Error('Valores polares deben ser números válidos')
      }
    } else if (state.vec.mode === 'cart') {
      if (state.vec.u.x === undefined || state.vec.u.y === undefined || 
          state.vec.v.x === undefined || state.vec.v.y === undefined) {
        throw new Error('Datos cartesianos incompletos')
      }
      // Validate numeric values
      const ux = parseFloat(state.vec.u.x)
      const uy = parseFloat(state.vec.u.y)
      const vx = parseFloat(state.vec.v.x)
      const vy = parseFloat(state.vec.v.y)
      
      if (isNaN(ux) || isNaN(uy) || isNaN(vx) || isNaN(vy)) {
        throw new Error('Valores cartesianos deben ser números válidos')
      }
    }
    
    const data = await postJSON('/api/vectors/calc', { 
      inputMode: state.vec.mode, 
      v1: state.vec.u, 
      v2: state.vec.v, 
      show: state.vec.show 
    })
    
    // Validate response data
    if (!data.plotSpec || !data.plotSpec.data || !data.plotSpec.layout) {
      throw new Error('Respuesta del servidor incompleta')
    }
    
    const out = $('#vec-numbers')
    out.innerHTML = ''
    const mk = (label, val)=>{ 
      const d=document.createElement('div'); 
      d.textContent = `${label}: ${val}`; 
      out.appendChild(d) 
    }
    mk('u(x,y)', data.v1.xy.map(n=>Number(n).toFixed(6)).join(', '))
    mk('v(x,y)', data.v2.xy.map(n=>Number(n).toFixed(6)).join(', '))
    mk('u+v', data.sum.map(n=>Number(n).toFixed(6)).join(', '))
    mk('u−v', data.diff.map(n=>Number(n).toFixed(6)).join(', '))
    mk('u·v', Number(data.dot).toFixed(6))
    mk('u×v (z)', Number(data.cross).toFixed(6))
    
    const layout = Object.assign({}, data.plotSpec.layout, { 
      dragmode: false, 
      autosize: true 
    })
    const config = { 
      displayModeBar:false, 
      scrollZoom:false, 
      doubleClick:false, 
      staticPlot:false, 
      responsive:true 
    }
    
    // Clear previous plot before creating new one
    const plotDiv = $('#vec-plot')
    if (plotDiv && plotDiv.data && plotDiv.data.length > 0) {
      Plotly.purge('vec-plot')
    }
    
    Plotly.newPlot('vec-plot', data.plotSpec.data, layout, config)
    disableSelectionOnPlot()
    $('#vec-error').textContent = ''
  } catch(e) { 
    $('#vec-error').textContent = 'Error: ' + e.message 
    console.error('Error updating vector plot:', e)
  }
}

function setupVectors(){
  const rebuild = ()=>{ buildVector($('#u-inputs'),'u'); buildVector($('#v-inputs'),'v') }
  $('#vec-mode').onchange = (e)=>{ state.vec.mode = e.target.value; rebuild() }
  $('#show-parallelogram').onchange = (e)=>{ 
    state.vec.show.parallelogram = e.target.checked
    updateVectorPlot()
  }
  $('#show-subtraction').onchange = (e)=>{ 
    state.vec.show.subtraction = e.target.checked
    updateVectorPlot()
  }
  
  // Initial setup
  rebuild()
  
  // Auto-plot on initial load with parallelogram enabled
  setTimeout(() => {
    updateVectorPlot()
  }, 100)
  $('#vec-run').onclick = async ()=>{
    $('#vec-error').textContent = ''
    try{
      const data = await postJSON('/api/vectors/calc', { inputMode: state.vec.mode, v1: state.vec.u, v2: state.vec.v, show: state.vec.show })
      const out = $('#vec-numbers')
      out.innerHTML = ''
      const mk = (label, val)=>{ const d=document.createElement('div'); d.textContent = `${label}: ${val}`; out.appendChild(d) }
      mk('u(x,y)', data.v1.xy.map(n=>Number(n).toFixed(6)).join(', '))
      mk('v(x,y)', data.v2.xy.map(n=>Number(n).toFixed(6)).join(', '))
      mk('u+v', data.sum.map(n=>Number(n).toFixed(6)).join(', '))
      mk('u−v', data.diff.map(n=>Number(n).toFixed(6)).join(', '))
      mk('u·v', Number(data.dot).toFixed(6))
      mk('u×v (z)', Number(data.cross).toFixed(6))
      const layout = Object.assign({}, data.plotSpec.layout, { dragmode: false, autosize: true })
      const config = { displayModeBar:false, scrollZoom:false, doubleClick:false, staticPlot:false, responsive:true }
      Plotly.newPlot('vec-plot', data.plotSpec.data, layout, config)
      disableSelectionOnPlot()
    }catch(e){ $('#vec-error').textContent = e.message }
  }
}

function init(){
  tabSwitch()
  setupMatrixControls()
  setupLinear()
  setupVectors()
  renderAll()
  disableSelectionOnPlot()
}

document.addEventListener('DOMContentLoaded', init)

function disableSelectionOnPlot(){
  const el = document.getElementById('vec-plot')
  if(!el) return
  el.addEventListener('selectstart', e=>{ e.preventDefault(); e.stopPropagation() })
  el.addEventListener('dragstart', e=>{ e.preventDefault(); e.stopPropagation() })
  el.addEventListener('mousedown', e=>{ if(e.button!==0){ e.preventDefault(); e.stopPropagation() } })
  el.addEventListener('mouseup', e=>{ if(e.button!==0){ e.preventDefault(); e.stopPropagation() } })
}