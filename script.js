async function loadData() {
  const response = await fetch("data/budsjettdata.json")
  return await response.json()
}

function populateFilters(data) {

  const years = [...new Set(data.map(d => d.år))].sort()
  const departments = [...new Set(data.map(d => d.departement))].sort()

  const yearSelect = document.getElementById("yearFilter")
  const deptSelect = document.getElementById("deptFilter")

  years.forEach(year => {
    const option = document.createElement("option")
    option.value = year
    option.textContent = year
    yearSelect.appendChild(option)
  })

  departments.forEach(dep => {
    const option = document.createElement("option")
    option.value = dep
    option.textContent = dep
    deptSelect.appendChild(option)
  })

}

function groupByDepartment(data){

  const result={}

  data.forEach(row=>{

    if(!result[row.departement]){
      result[row.departement]=0
    }

    result[row.departement]+=row.utgifter_mrd

  })

  return result
}

function biggestChanges(data){

  const sorted=[...data]
  .sort((a,b)=>b.utgifter_mrd-a.utgifter_mrd)
  .slice(0,10)

  return {
    labels:sorted.map(d=>d.departement),
    values:sorted.map(d=>d.utgifter_mrd)
  }

}

function biggestCuts(data){

  const sorted=[...data]
  .sort((a,b)=>a.utgifter_mrd-b.utgifter_mrd)
  .slice(0,10)

  return {
    labels:sorted.map(d=>d.departement),
    values:sorted.map(d=>d.utgifter_mrd)
  }

}

function populateChangesTable(data){

  const table = document.querySelector("#changesTable tbody")

  const byDept = {}

  data.forEach(row => {

    if(!byDept[row.departement]){
      byDept[row.departement] = {}
    }

    byDept[row.departement][row.år] = row.utgifter_mrd

  })

  Object.keys(byDept).forEach(dep => {

    const y2025 = byDept[dep][2025] || 0
    const y2026 = byDept[dep][2026] || 0

    const change = y2026 - y2025
    const percent = y2025 ? ((change / y2025) * 100).toFixed(1) : 0

    const row = `
    <tr>
    <td>${dep}</td>
    <td>${y2025}</td>
    <td>${y2026}</td>
    <td>${change.toFixed(1)}</td>
    <td>${percent}%</td>
    </tr>
    `

    table.innerHTML += row

  })

}

let currentChart

function renderChart(type,data){

  const ctx=document.getElementById("mainChart")

  if(currentChart){
    currentChart.destroy()
  }

  if(type==="dept"){

    const grouped=groupByDepartment(data)

    currentChart=new Chart(ctx,{
      type:"bar",
      data:{
        labels:Object.keys(grouped),
        datasets:[{
          label:"Totale utgifter (mrd kr)",
          data:Object.values(grouped)
        }]
      }
    })

  }

  if(type==="increase"){

    const result=biggestChanges(data)

    currentChart=new Chart(ctx,{
      type:"bar",
      data:{
        labels:result.labels,
        datasets:[{
          label:"Største økninger",
          data:result.values
        }]
      }
    })

  }

  if(type==="cut"){

    const result=biggestCuts(data)

    currentChart=new Chart(ctx,{
      type:"bar",
      data:{
        labels:result.labels,
        datasets:[{
          label:"Største kutt",
          data:result.values
        }]
      }
    })

  }

}

async function loadInnspill(){

  const response = await fetch("data/innspill.json")
  const data = await response.json()

  const table = document.querySelector("#innspillTable tbody")

  data.forEach(item => {

    let status = "Ingen gjennomslag"

    if(item.budsjett_mill >= item.innspill_mill){
      status = "Fullt gjennomslag"
    }
    else if(item.budsjett_mill > 0){
      status = "Delvis gjennomslag"
    }

    const row = `
    <tr>
    <td>${item.sak}</td>
    <td>${item.innspill_mill}</td>
    <td>${item.budsjett_mill}</td>
    <td>${status}</td>
    </tr>
    `

    table.innerHTML += row

  })

}

async function init(){

  const data = await loadData()

  populateFilters(data)
  populateChangesTable(data)

  renderChart("dept",data)

  document
  .getElementById("chartSelector")
  .addEventListener("change",(e)=>{

    renderChart(e.target.value,data)

  })

  loadInnspill()

}

init()
