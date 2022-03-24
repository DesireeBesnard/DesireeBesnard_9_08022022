/**
 * @jest-environment jsdom
 */

import {screen, waitFor, getByTestId} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";


jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    // GET intergration test
    test("fetches bills from mock API GET", async () => {

      const spy = jest.spyOn(mockStore, "bills")
      const bills = await mockStore.bills().list()

      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByText("Mes notes de frais"))
      const contentPending  = await screen.getByText("encore")
      const contentRefused  = await screen.getByText("test1")
      expect(spy).toHaveBeenCalled()
      expect(bills.length).toBe(4)
      expect(contentPending).toBeTruthy()
      expect(contentRefused).toBeTruthy()
    })


    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBeTruthy()
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("When I click on the eye icon", () => {
      test("Then the modal should open up", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        document.body.innerHTML = BillsUI({ data: bills })
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = mockStore
        const billsContainer = new Bills({ document, onNavigate, store, localStorage: window.localStorage })

        const handleClickIconEye = jest.fn(billsContainer.handleClickIconEye)
        const eyes = screen.getAllByTestId('icon-eye')
        for (const eye of eyes) {
          eye.addEventListener('click', handleClickIconEye(eye))
        }
        userEvent.click(eyes[0])
        expect(handleClickIconEye).toHaveBeenCalled()

        const modale = screen.getByText('Justificatif')
        expect(modale).toBeTruthy()
      })
    })

    describe("When I click on newBill button", () => {
      test("Then the newBill form should appear", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))

        document.body.innerHTML = BillsUI({ data: bills })
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = mockStore
        const billsContainer = new Bills({ document, onNavigate, store, localStorage: window.localStorage })

        const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill)
        const newBillBtn = getByTestId(document.body, "btn-new-bill")
        newBillBtn.addEventListener('click', handleClickNewBill())
        userEvent.click(newBillBtn)

        expect(handleClickNewBill).toHaveBeenCalled()
        expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()

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
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 505"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 505/)
      expect(message).toBeTruthy()
    })
  })
})
