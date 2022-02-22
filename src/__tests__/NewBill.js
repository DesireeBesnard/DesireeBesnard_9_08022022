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

    test("Then the newBill form should appear", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))

      userEvent.click(getByTestId(document.body,'btn-new-bill'))
      expect(
        screen.getByText('Envoyer une note de frais')
      ).toBeTruthy()

    })
  })
})

      // const html = NewBillUI()
      // document.body.innerHTML = html

      //to-do write assertion
      // userEvent.selectOptions(screen.getByTestId('expense-type'), 'Services en ligne')

      // userEvent.type(
      //   getByTestId(document.body, 'expense-name'), 'Facture Free Mobile'
      // )

      // userEvent.type(
      //   getByTestId(document.body, 'datepicker'), '28/02/2022'
      // )

      // userEvent.type(
      //   getByTestId(document.body, 'amount'), '16'
      // )

      // userEvent.type(
      //   getByTestId(document.body, 'vat'), '3'
      // )

      // userEvent.type(
      //   getByTestId(document.body, 'pct'), '20'
      // )

      // const file = new File(["facturefreemobile"], "facturefreemobile.jpg", {type: 'image/jpg'})
      // userEvent.upload(
      //   getByTestId(document.body, 'file'), file
      // )

      // const submitBtn = getByText(document.body, 'Envoyer')
      // userEvent.click(submitBtn)

      // expect(screen.getByText('Mes notes de frais')).toBeTruthy()