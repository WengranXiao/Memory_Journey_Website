
const defaultEntries = [
  {
    title: 'Water',
    date: 1149566400000,
    description: 'I went to a pool and swam around and splashed a few times and jumped off the diving board.'
  },
  {
    title: 'Coaster',
    date: 655531200000,
    description: 'Zoomed around on a roller coaster, going up down and on curves. Went way fast and did not drop my phone.'
  },
  {
    title: 'Leaves',
    date: 1046667600000,
    description: 'Raked some leaves and my lawn looked pretty good. The air smelled really good too.'
  },
];


const memoryContainer = document.querySelector('#memory-container');
const titleInput = document.querySelector("#title");
const dateInput = document.querySelector("#date");
const descriptionInput = document.querySelector("#description");
const addMemoryButton = document.querySelector("#add-memory");

let memoryList = localStorage.getItem('memory.list') ? JSON.parse(localStorage.getItem('memory.list')) : defaultEntries;


const formatDateForMemory = (dateString) =>  {
  return new Date(dateString).toLocaleDateString(undefined, { weekday:"long", year:"numeric", month:"short", day:"numeric"})
}

const localizedTimestamp = (dateString) => {
  return new Date(dateString).getTime() + new Date(dateString).getTimezoneOffset() * 60000
}

const renderMemories = () => {

  memoryContainer.innerHTML = '';
  memoryList = memoryList.sort((a, b) => (a.date > b.date) ? 1 : -1);
  localStorage.setItem('memory.list',JSON.stringify(memoryList));
  memoryList.forEach((ele)=>{ 
    memoryContainer.innerHTML += `<div class="position-relative col-12 border border-secondary rounded my-3 p-3 bg-white">
    <div class="d-flex">
      <h3>${ele.title}</h3>
      <small class="px-1 text-muted align-self-center">${formatDateForMemory(ele.date)}</small>
    </div>
  <button data-date="${ele.date}" class="close-button">Ⓧ</button>
  <p>${ele.description}</p>
  </div>`
  })
}

renderMemories();

addMemoryButton.addEventListener('click', (submit) => {
  
  memoryList.forEach((ele)=>{
    if (ele.date===localizedTimestamp(dateInput.value)){
      dateInput.classList.add("is-invalid");
    }else{
      dateInput.classList.remove("is-invalid");
    }
  })
  if (titleInput.value==='' || titleInput.value.includes(' ')){titleInput.classList.add("is-invalid")}else{titleInput.classList.remove("is-invalid")}
  if (dateInput.value===''){dateInput.classList.add("is-invalid")}else{dateInput.classList.remove("is-invalid")}
  if (descriptionInput.value===''){descriptionInput.classList.add("is-invalid")}else(descriptionInput.classList.remove("is-invalid"))
  
 
  if (titleInput.classList[1]!='is-invalid'&&dateInput.classList[1]!='is-invalid'&& descriptionInput.classList[1]!='is-invalid'){
    memoryList.push({
      title: titleInput.value ,
      date: localizedTimestamp(dateInput.value),
      description: descriptionInput.value
    })
    titleInput.value='';
    dateInput.value='';
    descriptionInput.value='';
    renderMemories();
  }   
})
memoryContainer.addEventListener('click', (e) => {
  if (e.target.hasAttribute('data-date')) {  
    memoryList.splice(memoryList.map(e=>e.date).indexOf(Number(e.target.getAttribute("data-date")))); 
    renderMemories();
  }
})



