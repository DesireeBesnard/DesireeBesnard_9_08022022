/**
 * @jest-environment jsdom
 */

import {screen, waitFor, getByText, getByTestId} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page and click  on newBill button", () => {

    beforeEach(async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
    })

    test("Then the newBill form should appear", async () => {

      userEvent.click(getByTestId(document.body,'btn-new-bill'))
      expect(
        screen.getByText('Envoyer une note de frais')
      ).toBeTruthy()

    })
  })

  describe("When I am on newBill page and submit a new bill", () => {
    test("A new Bill should be created", async () => {
      
      userEvent.selectOptions(screen.getByTestId('expense-type'), 'Hôtel et logement')

      userEvent.type(
        getByTestId(document.body, 'expense-name'), 'Update Bill'
      )

      userEvent.type(
        getByTestId(document.body, 'datepicker'), '04/04/2004'
      )

      userEvent.type(
        getByTestId(document.body, 'amount'), '400'
      )

      userEvent.type(
        getByTestId(document.body, 'vat'), '80'
      )

      userEvent.type(
        getByTestId(document.body, 'pct'), '20'
      )

      const file = new File(["facturefreemobile"], "facturefreemobile.jpg", {type: 'image/jpg'})
      userEvent.upload(
        getByTestId(document.body, 'file'), file
      )

      const submitBtn = getByText(document.body, 'Envoyer')
      userEvent.click(submitBtn)
      await waitFor(() => screen.getByText("Mes notes de frais"))

      expect(screen.getByText('Update Bill')).toBeTruthy()
    })
  })
})

      // const html = NewBillUI()
      // document.body.innerHTML = html

      //to-do write assertion
