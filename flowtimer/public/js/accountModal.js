// account modal hover
document.addEventListener("DOMContentLoaded", () => {
  const accountModal = document.getElementById("account-modal");
  if (!accountModal) return;

  const tooltip = accountModal.closest(".sidebar-item.tooltip");
  const emailSpan = tooltip.querySelector(".email");
  const signoutbtn = tooltip.querySelector("#signout");

  accountModal.addEventListener('mouseenter', async () =>{
      try{
        const res = await fetch("/api/user");
        const data = await res.json();

        if (data.email && emailSpan){
          emailSpan.textContent = data.email;
        }
      } catch (err){
        console.error(err);
      }
    })

   signoutbtn.addEventListener("click", () =>{
      window.location.href = "/logout";
    })
  })