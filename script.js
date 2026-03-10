async function loadData() {

const response = await fetch("data/budsjettdata.json")
return await response.json()

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

const labels=sorted.map(d=>d.departement)
const values=sorted.map(d=>d.utgifter_mrd)

return {labels,values}

}

function biggestCuts(data){

const sorted=[...data]

.sort((a,b)=>a.utgifter_mrd-b.utgifter_mrd)

.slice(0,10)

const labels=sorted.map(d=>d.departement)
const values=sorted.map(d=>d.utgifter_mrd)

return {labels,values}

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

async function init(){

const data=await loadData()

renderChart("dept",data)

document
.getElementById("chartSelector")
.addEventListener("change",(e)=>{

renderChart(e.target.value,data)

})

}

init()



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

window.addEventListener("DOMContentLoaded", loadInnspill)
