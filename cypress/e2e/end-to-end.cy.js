import sessionIds from "../fixtures/sessionIds.json";

let sessionOutput;

/** The whole workflow runs for each session given in the fixture. */
describe("Display screen", () => {
  sessionIds.forEach((sessionId) => {
    // before each test, session details are retrieved and if session is active, group details are retrieved.
    beforeEach(() => {
      cy.request({
        method: "POST",
        url: Cypress.env("backend") + "getSessionData",
        body: JSON.stringify({
          sessionId: sessionId,
        }),
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.sessionActive);

        sessionOutput = response.body.sessionActive;

        if (response.body.sessionActive) {
          cy.request({
            method: "POST",
            url: Cypress.env("backend") + "getGroupData",
            body: JSON.stringify({
              group: response.body.group,
            }),
            headers: {
              "content-type": "application/x-www-form-urlencoded",
            },
          }).then((response) => {
            expect(response.status).to.eq(200);
          });
        }
      });
    });

    it("visits each URL", () => {
      cy.visit(
        "https://staging-auth.avantifellows.org/?sessionId=" + sessionId
      );
      if (!sessionOutput) {
        cy.contains("p", "अभी आपकी कोई क्लास नहीं है|").should("be.visible");
      } else {
        cy.contains(
          "p",
          "Enter your Student ID / अपना Student ID दर्ज करें"
        ).should("be.visible");
      }
    });

    it("allows user to enter", () => {
      cy.get("input").type("20180027508");

      cy.request({
        method: "POST",
        url: Cypress.env("backend") + "checkForUser",
        body: JSON.stringify({
          userID: "20180027508",
          collectionName: "DelhiStudents",
          columnName: "student_id",
        }),
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.true;
      });
      cy.contains("SUBMIT / जमा करें").click();
    });
  });
});
