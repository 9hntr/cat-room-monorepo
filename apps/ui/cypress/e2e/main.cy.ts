describe("My React App", () => {
  it("should create a room", () => {
    cy.visit("http://localhost:5173/");

    const btnCreateRoom = cy.get('[data-testid="create-room-btn"]');
    btnCreateRoom.should("exist");
    btnCreateRoom.click();

    cy.contains("Enter your name");

    const btnJoinRoom = cy.get('[data-testid="join-room-btn"]');
    btnJoinRoom.should("exist");
    btnJoinRoom.click();

    const message = "Hello world";
    cy.get('[data-testid="chat-input"').as("chatInput").type(message);

    cy.get('[data-testid="chat-submit-btn"]').as("chatSubmitBtn");
    cy.get("@chatSubmitBtn").should("exist");
    cy.get("@chatSubmitBtn").click();

    cy.get('[data-testid="chat-message-placeholder"]')
      .as("chatMessage")
      .should("be.visible")
      .contains(message);

    cy.wait(7100);

    cy.get("@chatMessage").should("not.exist");

    cy.get(`[data-testid="user-character-Isabella"]`).rightclick();
    cy.wait(100);
    cy.get('[data-testid="chat-private-message"]').click();
    cy.get("@chatInput").type(message);
    cy.get("@chatSubmitBtn").click();

    cy.wait(3000);
    cy.get("@chatMessage").should("be.visible").contains(message);
    cy.get("@chatMessage").eq(1).should("be.visible");
  });
});
