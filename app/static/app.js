/*
  Aplicación frontend para la calculadora (Matrices, Ecuaciones, Vectores).
  - Renderiza matrices y sistemas en MathML y HTML.
  - Envía requests a la API FastAPI y muestra resultados.
  - Gestiona el estado de entrada y opciones de visualización de vectores con Plotly.
*/
const $ = (q) => document.querySelector(q)
const $$ = (q) => Array.from(document.querySelectorAll(q))

// Estado global del frontend
const state = {
  A: { rows: 2, cols: 2, values: [['0','0'],['0','0']] },
  B: { rows: 2, cols: 2, values: [['0','0'],['0','0']] },
  R: { rows: 0, cols: 0, values: [] },
  lin: { n: 2, A: [['0','0'],['0','0']], b: ['0','0'] },
  vec: { mode: 'polar', u: {mag:'1',deg:'0'}, v:{mag:'1',deg:'90'}, show:{parallelogram:true, subtraction:false} }
}

// Crea una representación MathML de una matriz
function createMathMLMatrix(values, interactive = false, key = null) {
  const mathNS = 'http://www.w3.org/1998/Math/MathML';
  const math = document.createElementNS(mathNS, 'math');
  math.setAttribute('display', 'block');

<<<<<<< HEAD
  // Detecta tamaño de matriz para estilo responsivo
=======
 
>>>>>>> 9b28fc1 (Corregir vector de resta u-v para que salga desde el origen en el gráfico de vectores)
  const isSmall = values.length <= 5 && values[0]?.length <= 5;

  if (isSmall) {
    math.classList.add('mathml-small');
  }

  const mrow = document.createElementNS(mathNS, 'mrow');

<<<<<<< HEAD
  // Paréntesis de apertura
=======

>>>>>>> 9b28fc1 (Corregir vector de resta u-v para que salga desde el origen en el gráfico de vectores)
  const mo1 = document.createElementNS(mathNS, 'mo');
  mo1.textContent = '(';
  mo1.setAttribute('stretchy', 'true');
  mo1.setAttribute('fence', 'true');
  mrow.appendChild(mo1);

  // Tabla de la matriz
  const mtable = document.createElementNS(mathNS, 'mtable');
  mtable.setAttribute('rowspacing', '0.5ex');
  mtable.setAttribute('columnspacing', '1em');

  for (let i = 0; i < values.length; i++) {
    const mtr = document.createElementNS(mathNS, 'mtr');
    for (let j = 0; j < values[i].length; j++) {
      const mtd = document.createElementNS(mathNS, 'mtd');

      if (interactive) {
        const input = document.createElement('input');
        input.className = isSmall ? 'mathml-input mathml-input-small' : 'mathml-input';
        input.value = values[i][j] || '0';
        input.addEventListener('input', () => {
          if (key && state[key]) {
            state[key].values[i][j] = input.value;
          }
        });
        mtd.appendChild(input);
      } else {
        const mn = document.createElementNS(mathNS, 'mn');
        mn.textContent = values[i][j] || '0';
        if (isSmall) mn.classList.add('mathml-mn-small');
        mtd.appendChild(mn);
      }

      mtr.appendChild(mtd);
    }
    mtable.appendChild(mtr);
  }

  mrow.appendChild(mtable);

  // Paréntesis de cierre
  const mo2 = document.createElementNS(mathNS, 'mo');
  mo2.textContent = ')';
  mo2.setAttribute('stretchy', 'true');
  mo2.setAttribute('fence', 'true');
  mrow.appendChild(mo2);

  math.appendChild(mrow);
  return math;
}

// Construye UI para matriz editable (A o B)
function buildMatrix(container, key){
  const m = state[key]
  container.innerHTML = ''
  
  // Create MathML representation
  const mathMLContainer = document.createElement('div');
  mathMLContainer.className = 'mathml-container';
  const mathML = createMathMLMatrix(m.values, true, key);
  mathMLContainer.appendChild(mathML);
  container.appendChild(mathMLContainer);
}

// Renderiza una vista previa de fracción (a/b) junto a un input
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

// Cambia el tamaño de filas/columnas de una matriz conservando valores
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

// Construye inputs para vector u/v según modo (polar/cartesiano)
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

// Re-renderiza todo el panel (matrices, sistema y vectores)
function renderAll(){
  buildMatrix($('#matrixA'), 'A')
  buildMatrix($('#matrixB'), 'B')
  if(state.R.rows>0) {
    const container = $('#matrixR')
    container.innerHTML = ''
    const mathMLContainer = document.createElement('div')
    mathMLContainer.className = 'mathml-container result'
    const mathML = createMathMLMatrix(state.R.values, false)
    mathMLContainer.appendChild(mathML)
    container.appendChild(mathMLContainer)
  }
  buildLin()
  buildVector($('#u-inputs'), 'u')
  buildVector($('#v-inputs'), 'v')
}


// Construye el bloque de sistema de ecuaciones lineales con una llave SVG
function buildLin(){
  const n = state.lin.n;
  const A = state.lin.A;
  const b = state.lin.b;
  const eqSystem = document.getElementById('eq-system');
  eqSystem.innerHTML = '';

  // Dibuja llave SVG decorativa a la izquierda del sistema
  const braceHeight = 38 * n + 10;
  const braceSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  braceSVG.setAttribute('width', '32');
  braceSVG.setAttribute('height', braceHeight);
  braceSVG.setAttribute('viewBox', `0 0 32 ${braceHeight}`);
  braceSVG.classList.add('eq-brace-svg');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  // Parámetros para la llave
  const xLeft = 10, xRight = 28;
  const yTop = 5, yBot = braceHeight-5;
  const yMid = braceHeight/2;
  const yHook = 18;
  // Path con ganchos y pico central (curvas Bezier/Q)
  const yPico = 16;
  const d = `M ${xRight} ${yTop}
    C ${xLeft} ${yTop}, ${xLeft} ${yTop+yHook}, ${xLeft} ${yMid-yPico}
    Q ${xLeft-8} ${yMid}, ${xLeft} ${yMid+yPico}
    C ${xLeft} ${yBot-yHook}, ${xLeft} ${yBot}, ${xRight} ${yBot}`;
  path.setAttribute('d', d);
  path.setAttribute('stroke', 'var(--color-accent)');
  path.setAttribute('stroke-width', '6');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  braceSVG.appendChild(path);
  eqSystem.appendChild(braceSVG);

  // Filas con coeficientes A y términos independientes b
  const rows = document.createElement('div');
  rows.className = 'eq-system-rows';
  for(let i=0; i<n; i++){
    const row = document.createElement('div');
    row.className = 'eq-system-row';
    for(let j=0; j<n; j++){
      const input = document.createElement('input');
      input.className = 'eq-system-input';
      input.value = A[i][j] || '0';
      input.addEventListener('input', ()=>{ A[i][j] = input.value });
      row.appendChild(input);
      // Muestra variable x_j con subíndice junto a cada coeficiente
      const varSpan = document.createElement('span');
      varSpan.innerHTML = `x<sub>${j+1}</sub>`;
      varSpan.style.marginRight = '6px';
      varSpan.style.fontWeight = '500';
      varSpan.style.fontSize = '15px';
      varSpan.style.color = 'var(--color-accent)';
      row.appendChild(varSpan);
      if(j < n-1){
        const plus = document.createElement('span');
        plus.textContent = '+';
        plus.style.marginRight = '6px';
        plus.style.fontWeight = '500';
        plus.style.color = 'var(--color-accent)';
        row.appendChild(plus);
      }
    }
    // Igual y b_i
    const eq = document.createElement('span');
    eq.className = 'eq-system-equal';
    eq.textContent = '=';
    row.appendChild(eq);
    const bInput = document.createElement('input');
    bInput.className = 'eq-system-input';
    bInput.value = b[i] || '0';
    bInput.addEventListener('input', ()=>{ b[i] = bInput.value });
    row.appendChild(bInput);
    rows.appendChild(row);
  }
  eqSystem.appendChild(rows);
}

// Incrementa tamaño del sistema (n → n+1)
function addLinSize(){
  const n = state.lin.n + 1
  const A = Array.from({length:n}, (_,i)=> Array.from({length:n}, (_,j)=> (state.lin.A[i]&&state.lin.A[i][j])||'0'))
  const b = Array.from({length:n}, (_,i)=> state.lin.b[i] || '0')
  state.lin = { n, A, b }
}

// Decrementa tamaño del sistema (n → n-1, mínimo 2)
function delLinSize(){
  if(state.lin.n <= 2){ return }
  const n = state.lin.n - 1
  const A = Array.from({length:n}, (_,i)=> Array.from({length:n}, (_,j)=> (state.lin.A[i]&&state.lin.A[i][j])||'0'))
  const b = Array.from({length:n}, (_,i)=> state.lin.b[i] || '0')
  state.lin = { n, A, b }
}

// Helper para POST JSON con manejo de errores
async function postJSON(url, body){
  const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
  const data = await res.json()
  if(!res.ok){ throw new Error(data.detail || 'Error') }
  return data
}


// Pestañas tipo pill con indicador animado y comportamiento responsivo
function tabSwitch(){
  const tabs = $$('.pill-tab');
  const indicator = $('.pill-indicator');
  function moveIndicator(activeTab) {
    const nav = activeTab.parentElement;
    const rect = activeTab.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    indicator.style.left = (rect.left - navRect.left) + 'px';
    indicator.style.width = rect.width + 'px';
  }
  tabs.forEach(btn=> btn.addEventListener('click', ()=>{
    tabs.forEach(b=> b.classList.remove('active'));
    btn.classList.add('active');
    moveIndicator(btn);
    const t = btn.dataset.tab;
    $$('.panel').forEach(p=> p.classList.remove('active'));
    $('#'+t).classList.add('active');
  }));
  // Inicializar posición del indicador
  const activeTab = tabs.find(tab => tab.classList.contains('active'));
  if(activeTab) moveIndicator(activeTab);
  window.addEventListener('resize', ()=>{
    const activeTab = tabs.find(tab => tab.classList.contains('active'));
    if(activeTab) moveIndicator(activeTab);
  });
}

// Registra handlers de UI para edición y ejecución de operaciones de matrices
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

// Registra handlers para resolver el sistema por Cramer o por inversa
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

// Inserta un bloque con título, matriz en MathML y subtítulo opcional
function appendMatrix(parent, title, mat, subtitle){
  const wrap = document.createElement('div')
  wrap.className = 'matrix-result-block';
  
  const ttl = document.createElement('div');
  ttl.className = 'matrix-title';
  ttl.textContent = title;
  wrap.appendChild(ttl);
  
  if (Array.isArray(mat) && mat.length > 0) {
    const mathMLContainer = document.createElement('div');
    mathMLContainer.className = 'mathml-container result';
    const mathML = createMathMLMatrix(mat, false);
    mathMLContainer.appendChild(mathML);
    wrap.appendChild(mathMLContainer);
  }
  
  if (subtitle) {
    const st = document.createElement('div');
    st.className = 'matrix-subtitle';
    st.textContent = subtitle;
    wrap.appendChild(st);
  }
  
  parent.appendChild(wrap);
}

// Actualiza la gráfica de vectores validando entradas y respuesta del servidor
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

// Configura UI de vectores, auto-plot y acciones de cálculo
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
      mk('u·v (producto punto)', Number(data.dot).toFixed(6))
      mk('u×v (producto cruz)', Number(data.cross).toFixed(6))
      const layout = Object.assign({}, data.plotSpec.layout, { dragmode: false, autosize: true })
      const config = { displayModeBar:false, scrollZoom:false, doubleClick:false, staticPlot:false, responsive:true }
      Plotly.newPlot('vec-plot', data.plotSpec.data, layout, config)
      disableSelectionOnPlot()
    }catch(e){ $('#vec-error').textContent = e.message }
  }
  
  $('#vec-dot').onclick = async ()=>{
    $('#vec-error').textContent = ''
    try{
      const data = await postJSON('/api/vectors/calc', { inputMode: state.vec.mode, v1: state.vec.u, v2: state.vec.v, show: state.vec.show })
      const out = $('#vec-numbers')
      out.innerHTML = ''
      const result = document.createElement('div')
      result.style.fontSize = '18px'
      result.style.fontWeight = 'bold'
      result.textContent = `Producto punto u·v = ${Number(data.dot).toFixed(6)}`
      out.appendChild(result)
    }catch(e){ $('#vec-error').textContent = e.message }
  }
  
  $('#vec-cross').onclick = async ()=>{
    $('#vec-error').textContent = ''
    try{
      const data = await postJSON('/api/vectors/calc', { inputMode: state.vec.mode, v1: state.vec.u, v2: state.vec.v, show: state.vec.show })
      const out = $('#vec-numbers')
      out.innerHTML = ''
      const result = document.createElement('div')
      result.style.fontSize = '18px'
      result.style.fontWeight = 'bold'
      result.textContent = `Producto cruz u×v = ${Number(data.cross).toFixed(6)}`
      out.appendChild(result)
    }catch(e){ $('#vec-error').textContent = e.message }
  }
}

// Punto de entrada del frontend
function init(){
  tabSwitch()
  setupMatrixControls()
  setupLinear()
  setupVectors()
  renderAll()
  disableSelectionOnPlot()
}

document.addEventListener('DOMContentLoaded', init)

// Evita selección de texto/drag en el contenedor de la gráfica para mejor UX
function disableSelectionOnPlot(){
  const el = document.getElementById('vec-plot')
  if(!el) return
  el.addEventListener('selectstart', e=>{ e.preventDefault(); e.stopPropagation() })
  el.addEventListener('dragstart', e=>{ e.preventDefault(); e.stopPropagation() })
  el.addEventListener('mousedown', e=>{ if(e.button!==0){ e.preventDefault(); e.stopPropagation() } })
  el.addEventListener('mouseup', e=>{ if(e.button!==0){ e.preventDefault(); e.stopPropagation() } })
}