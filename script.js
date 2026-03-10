async function loadData() {

const response = await fetch("data/budsjettdata.json")
const data = await response.json()

return data

}

function getDepartments(data){

return [...new Set(data.map(d => d.departement))]

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

function groupByYear(data, department){

const result={}

data
.filter(d => d.departement === department)
.forEach(row=>{

result[row.år]=row.utgifter_mrd

})

return result

}

function drawDepartmentChart(grouped){

const ctx=document.getElementById("deptChart")

new Chart(ctx,{

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

function drawTimeSeries(data,department){

const grouped=groupByYear(data,department)

const canvas=document.createElement("canvas")

document.querySelector(".dashboard").appendChild(canvas)

new Chart(canvas,{

type:"line",

data:{

labels:Object.keys(grouped),

datasets:[{

label:department + " utvikling",

data:Object.values(grouped),

fill:false

}]

}

})

}

async function init(){

const data=await loadData()

const grouped=groupByDepartment(data)

drawDepartmentChart(grouped)

const departments=getDepartments(data)

departments.forEach(dep => {

drawTimeSeries(data,dep)

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
