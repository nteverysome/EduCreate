describe('Authentication Flow', () => {
  beforeEach(() => {
    // 訪問首頁
    cy.visit('/');
  });

  it('should navigate to login page', () => {
    // 點擊登錄按鈕
    cy.contains('登入').click();
    
    // 確認URL包含login路徑
    cy.url().should('include', '/login');
    
    // 確認頁面包含登錄表單
    cy.get('form').should('exist');
    cy.contains('電子郵件').should('exist');
    cy.contains('密碼').should('exist');
  });

  it('should show validation errors on empty form submission', () => {
    // 訪問登錄頁面
    cy.visit('/login');
    
    // 提交空表單
    cy.get('form').submit();
    
    // 檢查錯誤訊息
    cy.contains('請輸入電子郵件').should('be.visible');
    cy.contains('請輸入密碼').should('be.visible');
  });

  it('should navigate to registration page', () => {
    // 訪問登錄頁面
    cy.visit('/login');
    
    // 點擊註冊鏈接
    cy.contains('註冊新帳號').click();
    
    // 確認URL包含register路徑
    cy.url().should('include', '/register');
    
    // 確認頁面包含註冊表單
    cy.get('form').should('exist');
    cy.contains('姓名').should('exist');
    cy.contains('電子郵件').should('exist');
    cy.contains('密碼').should('exist');
  });
});