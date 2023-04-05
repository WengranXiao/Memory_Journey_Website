// Monitor console warnings, errors, and logs
let consoleError;
let consoleWarning;
let consoleLog;


Cypress.on('window:before:load', (win) => {
  consoleError = cy.spy(win.console, 'error');
  consoleWarning = cy.spy(win.console, 'warn');
  consoleLog = cy.spy(win.console, 'log');
});
const DELAY = 1000;

const localizedTimestamp = (dateString) => {
  return new Date(dateString).getTime() + new Date(dateString).getTimezoneOffset() * 60000
}

const formatDateForMemory = (dateString) =>  {
  return new Date(dateString).toLocaleDateString(undefined, { weekday:"long", year:"numeric", month:"short", day:"numeric"})
}

describe('Basic Tests', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test.
    cy.visit(`http://localhost:${Cypress.env('theport') || 8080}`)
  })
  it('passes a very basic test to confirm tests are running', () => {
    cy.get('h1').should('include.text', 'Memory Journal')
    cy.get('main').should('include.text', 'Add A Memory')
  })

  // THINGS TO TEST

  // - That the list is correctly sorted by date after adding memories. Done
  // - Each type of validation, check the message appears, and the is-invalid class appears Done
  //   for a given validation-failing input
        // VALIDATION CRITERIA:
        //   titleInput: must not be empty, and must be one word (i.e. no spaces)
        //   dateInput: must not be empty, and must not be a date used by another memory
        //     @tip use localizedTimestamp() to convert the date input value into something
        //     you can compare to a memory date field
        //   descriptionInput: must not be empty
  // - if there are multiple validation-failing attempts, the is-invalid class is removed from any
  //   input that now passes validation, even if *other* inputs are now failing. Done
  // - When a memory is successfully added, the intputs are cleared. Done
  // - Clicking the Ⓧ removes the corresponding memory (and make sure nothing additional removed) Done
  // - Make sure the memory has the correct HTML structure Done
  // - The memory date should be formatted the expected manner. Done
  // - Make sure localStorage is updated when items are added or removed and the list continues to render properly.
  //   (in class exercise 7 has several tests checking localStorage). Done

  describe('check input validation is set up correctly',()=>{
    it('titleInput validation check',()=>{
      cy.get('#title').should(e=>{
        expect(e.attr('class')).to.equal('form-control','The titleInput should not have invalid class at the beginning')
      })
      cy.get('.invalid-feedback').eq(0).should('not.be.visible','The error message should be invisible at the beginning')
      cy.get('#add-memory').click()
      cy.get('#title').should(e=>{
        expect(e.attr('class')).to.contain('is-invalid','The titleInput should have is-invalid class because the input is empty')
      })

      let testList=['Test','Two words']
      testList.forEach(val=>{
        cy.get('#title').type(val)
        cy.get('#add-memory').click()
        if(val.indexOf(' ')!==-1){
          cy.get('#title').should(e=>{
            expect(e.attr('class')).to.contain('is-invalid','The titleInput should have is-invalid class because the input has more than one word')
          })
          cy.get('.invalid-feedback').eq(0).should('be.visible','The error message should be visible')
        }
        else{
          cy.get('#title').should(e=>{
            expect(e.attr('class')).equals('form-control','The titleInput should not have invalid class when the input contains only one word')
          })
          cy.get('.invalid-feedback').eq(0).should('not.be.visible','The error message should not be visible when input passes the validation')
        }

      })
    })

    it('dateInput validation check',()=>{
      cy.get('#date').should(e=>{
        expect(e.attr('class')).equals('form-control','The dateInput should not have invalid class at the beginning')
      })
      cy.get('.invalid-feedback').eq(1).should('not.be.visible','The error message should be invisible at the beginning')
      cy.get('#add-memory').click()
      cy.get('#date').should(e=>{
        expect(e.attr('class')).to.contain('is-invalid','The dateInput should have is-invalid class because the input is empty')
      })
      let today = new Date().toISOString().slice(0, 10)
      let testList=['1990-10-10','2003-03-03','2006-06-06']
      testList.forEach(val=>{
        cy.get('#date').type(val)
        cy.get('#date').should(e=>{
          expect(e.attr('class')).to.contain('is-invalid','The dateInput should have is-invalid class because the input has the same date with that in the memory list')
        })
        cy.get('.invalid-feedback').eq(1).should('be.visible','The error message should be visible')
      })
      cy.get('#date').type(today)
      cy.get('#add-memory').click()
      cy.get('#date').should(e=>{
        expect(e.attr('class')).equals('form-control','The dateInput should not have invalid class when input passes the validation')
      })
      cy.get('.invalid-feedback').eq(1).should('not.be.visible','The error message should not be visible when input passes the validation')
    })

    it('descriptionInput validation check',()=>{
      cy.get('#description').should(e=>{
        expect(e.attr('class')).equals('form-control','The descriptionInput should not have invalid class at the beginning')
      })
      cy.get('.invalid-feedback').eq(2).should('not.be.visible','The error message should be invisible at the beginning')
      cy.get('#add-memory').click()
      cy.get('#description').should(e=>{
        expect(e.attr('class')).to.contain('is-invalid','The descriptionInput should have is-invalid class because the input is empty')
      })
      cy.get('.invalid-feedback').eq(2).should('be.visible','The error message should be visible')
      cy.get('#description').type('For tests')
      cy.get('#add-memory').click()
      cy.get('#description').should(e=>{
        expect(e.attr('class')).equals('form-control','The descriptionInput should not have invalid class after some inputs')
      })
      cy.get('.invalid-feedback').eq(2).should('not.be.visible','The error message should not be visible when input passes the validation')
    })

    it('the is-invalid class is removed from any input that now passes validation, even if other inputs are now failing',()=>{
      let today = new Date().toISOString().slice(0, 10)
      cy.get('#add-memory').click()
      cy.get('#title').should(e=>{
        expect(e.attr('class')).to.contain('is-invalid','The titleInput should have is-invalid class because the input is empty')
      })
      cy.get('#date').should(e=>{
        expect(e.attr('class')).to.contain('is-invalid','The dateInput should have is-invalid class because the input is empty')
      })
      cy.get('#description').should(e=>{
        expect(e.attr('class')).to.contain('is-invalid','The descriptionInput should have is-invalid class because the input is empty')
      })
      cy.get('#title').type('Test')
      cy.get('#add-memory').click()
      cy.get('#title').should(e=>{
        expect(e.attr('class')).equals('form-control','The titleInput should not have invalid class when the input contains only one word')
      })
      cy.get('#title').clear()
      cy.get('#date').type(today)
      cy.get('#add-memory').click()
      cy.get('#date').should(e=>{
        expect(e.attr('class')).equals('form-control','The dateInput should not have invalid class when the input passes the validation')
      })
      cy.get('#date').clear()
      cy.get('#description').type('For tests')
      cy.get('#add-memory').click()
      cy.get('#description').should(e=>{
        expect(e.attr('class')).equals('form-control','The descriptionInput should not have invalid class when the input passes the validation')
      })
    })

  })

  describe('check button interaction',()=>{
    it('should clear the input after correctly adding memories',()=>{
      let today = new Date().toISOString().slice(0, 10)
      cy.get('#title').type('Test')
      cy.get('#date').type(today)
      cy.get('#description').type('This is a test memory')
      cy.get('#add-memory').click()
      cy.get('#title').should(e=>{
        expect(e.text()).to.eq('','The titleInput should be clear after adding the memory')
      })
      cy.get('#date').should(e=>{
        expect(e.text()).to.eq('','The dateInput should be clear after adding the memory')
      })
      cy.get('#description').should(e=>{
        expect(e.text()).to.eq('','The descriptionInput should be clear after adding the memory')
      })
    })

    it('clicking the close button should remove the corresponding memory',()=>{
      let defaultLen
      let firstTitle
      let deleteTitle
      cy.get('#memory-container').then(e=>{
        defaultLen = e.children().length
      })
      cy.get('#memory-container > div').eq(0).find('h3').should(e=>{
        firstTitle = e.text()
      })
      cy.get('#memory-container > div').last().find('h3').should(e=>{
        deleteTitle = e.text()
      })
      cy.get('.close-button').last().click()
      cy.get('#memory-container').should(e=>{
        expect(e.children().length).eq(defaultLen-1)
      })
      cy.get('#memory-container > div').each($divs => {
        cy.wrap($divs).within(()=>{
          cy.get('h3').should(e=>{
            expect(e.text()).to.not.equal(deleteTitle)
          })
        })
      })
      cy.get('#memory-container > div').eq(0).find('h3').should(e=>{
        expect(e.text()).eq(firstTitle)
      })
    })

  })

  describe('check memory list',()=>{
    it('memoryList should has the correct HTML structure',()=>{
      cy.get('#memory-container > div').each(($divs) => {
        expect($divs.children().length).eq(3)
        expect($divs.attr('class')).eq('position-relative col-12 border border-secondary rounded my-3 p-3 bg-white')
        cy.wrap($divs).within(()=>{
          cy.get('div').should(e=>{
            expect(e.children().length).eq(2)
          })
          cy.get('div').find('h3').should('exist')
          cy.get('div').find('small').should(e=>{
            expect(e.attr('class')).to.equal('px-1 text-muted align-self-center')
            expect(e).exist
          })
          cy.get('button').should('have.class','close-button')
          cy.get('p').should('exist')
        })
      })
    })

    it('the memory date should be formatted the expected manner',()=>{
      cy.get('#memory-container > div').each($divs => {
        cy.wrap($divs).within(()=>{
          cy.get('small').should(e=>{
            expect(e.text()).to.match(/^([A-Za-z]+), ([A-Za-z]+) ([0-9]{1,2}), ([0-9]{4})$/,"The date should be formatted in 'weekday, mmm dd, yyyy'")
          })
        })
      })
    })

    it('should sort memories by date', () => {
      let today = new Date().toISOString().slice(0, 10)
      cy.get('#title').type('Test')
      cy.get('#date').type(today)
      cy.get('#description').type('This is a test memory')
      cy.get('#add-memory').click()
      .then(()=>{
        let localMemoryList = JSON.parse(localStorage.getItem('memory.list'))
        let sortedDate = localMemoryList.sort((a, b) => a.date > b.date ? 1 : -1)
        .map(val=> formatDateForMemory(val.date))

        cy.get('#memory-container > div').each(($divs,i) => {
          cy.wrap($divs).within(()=>{
            cy.get('small').should($div=>{
              expect($div.text()).eq(sortedDate[i], `The date ${sortedDate[i]} is in position ${i}`)
            })
          })
        })
      })
    });
  })

  describe('check localStorage updated correctly',()=>{
    it('should update the localStorage after adding items',()=>{
      let today = new Date().toISOString().slice(0, 10)
      let title = 'Test'
      let description = 'This is a test memory'
      cy.get('#title').type(title)
      cy.get('#date').type(today)
      cy.get('#description').type(description)
      cy.get('#add-memory').click().then(()=>{
        let localList = JSON.parse(localStorage.getItem('memory.list'))
        expect(localList[localList.length-1]).to.deep.eq({
          date: localizedTimestamp(today),
          title: title,
          description:description
        })
        cy.get('#memory-container').should(e=>{
          expect(e.children().length).eq(localList.length)
        })
        cy.get('#memory-container > div').each(($divs,i)=>{
          cy.wrap($divs).within(()=>{
            cy.get('h3').should(e=>{
              expect(e.text()).eq(localList[i].title, 'title shows up in <h3>')
            })
            cy.get('p').should(e=>{
              expect(e.text()).eq(localList[i].description, 'description shows up in a <p> tag')
            })
            cy.get('small').should(e=>{
              expect(e.text()).eq(formatDateForMemory(localList[i].date), 'date shows up in a <small> tag')
            })
          })
        })
      })
    })

    it('should update the localStorage after removing items',()=>{
      let preLocalList = JSON.parse(localStorage.getItem('memory.list'))
      expect(preLocalList.length).to.equal(3, 'the localStorage of memorylist starts with 3 items')
      cy.get('#memory-container').should(e => {
        let testNum = parseInt(Math.random() * preLocalList.length)
        e.children().eq(testNum).find('button').click()
        preLocalList.splice(testNum,1)
      })
      .then(()=>{
        let curLocalList = JSON.parse(localStorage.getItem('memory.list'))
        expect(preLocalList.length).to.equal(2, 'the reference we confirm removal with has two items.')
        curLocalList.forEach((val,i)=>{
          expect(val).to.deep.eq(preLocalList[i], 'removing a memory from the UI removes it from local storage too.')
        })
      })
    })

  })


  afterEach(() => {
    // Confirm there are no console log/warning/errors after every test iteration.
    cy.wait(DELAY).then(() => {
      expect(consoleError, 'ERRORS FOUND IN YOUR CODE, CHECK THE JS CONSOLE').to.not.be.called;
      expect(consoleWarning, 'WARNINGS FOUND IN YOUR CODE, CHECK THE JS CONSOLE').to.not.be.called;
      expect(consoleLog, 'YOU SHOULD NOT HAVE console.log() IN YOUR SUBMITTED CODE').to.not.be.called;
    });
  });
})
