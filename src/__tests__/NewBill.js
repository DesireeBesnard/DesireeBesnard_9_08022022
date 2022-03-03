/**
 * @jest-environment jsdom
 */
import {screen, getByTestId, fireEvent} from "@testing-library/dom"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js";
import router from "../app/Router"


jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  
  describe("When I am on NewBill Page with an empty form and click on newBill button", () => {

    test("Then I should stay on the form", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI()

      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e)=> e.preventDefault())

      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)

      expect(screen.getByTestId('expense-name').value).toBe("")
      expect(screen.getByTestId('datepicker').value).toBe("")
      expect(screen.getByTestId('amount').value).toBe("")
      expect(screen.getByTestId('vat').value).toBe("")
      expect(screen.getByTestId('pct').value).toBe("")
      expect(screen.getByTestId('commentary').value).toBe("")
      expect(screen.getByTestId('file').value).toBe("")
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()

    })
  })

  describe("When I am on newBill page and upload a file with the wrong extension", () => {

    test("An error message should appear", () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI()
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const store = mockStore
      const newBill = new NewBill({ document, onNavigate, store, localStorage })
      newBill.handleChangeFile = jest.fn()

      const inputFile = screen.getByTestId('file')
      inputFile.addEventListener("change", newBill.handleChangeFile)


      function MockFile() {}

      MockFile.prototype.create = function (name, size, mimeType) {
        name = name || "mock.txt"
        size = size || 1024
        mimeType = mimeType || 'plain/txt'
    
        function range(count) {
            let output = ""
            for (let i = 0; i < count; i++) {
                output += "a"
            }
            return output
        }
    
        let blob = new Blob([range(size)], { type: mimeType })
        blob.lastModifiedDate = new Date()
        blob.name = name
    
        let file = new File([blob], "mock.txt", { type: mimeType })
        file.lastModifiedDate = new Date()
        return file
      }

      const mock = new MockFile()
      const file = mock.create()
      userEvent.upload(inputFile, file)

      expect(screen.getByText('Seuls les formats jpg, jpeg et png sont valides')).toBeTruthy()
    })
  })

  describe("When I am on NewBill Page, the form is incomplete and I click on send button", () => {
    test("Then I should stay on newBill page", () => {
      document.body.innerHTML = NewBillUI()
      const inputData = {
        name: "Vol Paris Londres" ,
        amount: 438,
        vat: "70",
        pct: 20,
        comment: "Dernier voyage",
        fileUrl: "facturefreemobile.jpg"
      }

      const name = screen.getByTestId('expense-name')
      fireEvent.change(name, {target: {value: inputData.name}})
      expect(name.value).toBe(inputData.name)

      const date = screen.getByTestId('datepicker')
      expect(date.value).toEqual("")

      const amount = screen.getByTestId('amount')
      fireEvent.change(amount, {target: {value: inputData.amount}})
      expect(parseInt(amount.value)).toBe(inputData.amount)

      const vat = screen.getByTestId('vat')
      fireEvent.change(vat, {target: {value: inputData.vat}})
      expect(vat.value).toBe(inputData.vat)

      const pct = screen.getByTestId('pct')
      fireEvent.change(pct, {target: {value: inputData.pct}})
      expect(parseInt(pct.value)).toBe(inputData.pct)

      const comment = screen.getByTestId('commentary')
      fireEvent.change(comment, {target: {value: inputData.comment}})
      expect(comment.value).toBe(inputData.comment)

      const file = new File(["facturefreemobile"], "facturefreemobile.jpg", {type: 'image/jpg'})
      const inputFile = screen.getByTestId('file')
      userEvent.upload(inputFile, file)
      expect(inputFile.files[0]).toStrictEqual(file)

      const form = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn((e) => e.preventDefault())

      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)

      expect(screen.getByTestId('form-new-bill')).toBeTruthy()

    })
  })

  describe("When I am on Newbill page and the form is completed correctly", () => {
    describe("When I click on submit button", () => {

      test("Then the file should be uploaded", async () => {

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = NewBillUI()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
  
        const store = mockStore
        const newBill = new NewBill({ document, onNavigate, store, localStorage })
        newBill.handleChangeFile = jest.fn()

        const inputFile = screen.getByTestId('file')
        inputFile.addEventListener("change", newBill.handleChangeFile)
  
  
        function MockFile() {}
  
        MockFile.prototype.create = function (name, size, mimeType) {
          name = name || "test.jpg"
          size = size || 1024
          mimeType = mimeType || 'image/jpg'
      
          function range(count) {
              let output = ""
              for (let i = 0; i < count; i++) {
                  output += "a"
              }
              return output
          }
      
          let blob = new Blob([range(size)], { type: mimeType })
          blob.lastModifiedDate = new Date()
          blob.name = name
      
          let file = new File([blob], "test.jpg", { type: mimeType })
          file.lastModifiedDate = new Date()
          return file
        }
  
        const mock = new MockFile()
        const file = mock.create()
        userEvent.upload(inputFile, file)

        expect(newBill.handleChangeFile).toHaveBeenCalled()
        expect(inputFile.files[0].name).toBe('test.jpg')
      })

      test("Then the newBill should be submitted", () => {

        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = NewBillUI()
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const inputData = {
          name: "encore",
          date: "04/04/2004",
          amount: 400,
          vat: "80",
          pct: 20,
          comment: "ok",
          fileUrl: "facturefreemobile.jpg"
        }

        fireEvent.change(screen.getByTestId('expense-name'), {target: {value: inputData.name}})
        userEvent.type(getByTestId(document.body, 'datepicker'), inputData.date)
        fireEvent.change(screen.getByTestId('amount'), {target: {value: inputData.amount}})
        fireEvent.change(screen.getByTestId('vat'), {target: {value: inputData.vat}})
        fireEvent.change(screen.getByTestId('pct'), {target: {value: inputData.pct}})                                                   
        fireEvent.change(screen.getByTestId('commentary'), {target: {value: inputData.comment}})
        const file = new File(["facturefreemobile"], inputData.fileUrl, {type: 'image/jpg'})
        const inputFile = screen.getByTestId('file')
        userEvent.upload(inputFile, file)

        const form = screen.getByTestId('form-new-bill')

        const store = mockStore
        const newBill = new NewBill({ document, onNavigate, store, localStorage })
        newBill.handleSubmit = jest.fn()
        newBill.updateBill = jest.fn()

        form.addEventListener("submit", newBill.handleSubmit)
        fireEvent.submit(form)

        expect(newBill.handleSubmit).toHaveBeenCalled()
        expect(screen.getByText('Mes notes de frais')).toBeTruthy()
      })
    })
  })

  describe("When an error occurs on API", () => {

    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "e@e"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    test("Then in case of 404 error a 404 error message should appear", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);
      const message = await screen.getByText("Mes notes de frais")
      expect(message).toBeTruthy()
    })
  })
})
