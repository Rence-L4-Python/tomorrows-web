window.addEventListener("DOMContentLoaded", ()=>{
    const adminRedirect = document.getElementById('adminRedirect');

    if (!adminRedirect) return;

    adminRedirect.addEventListener("click", () =>{ // for the invisible element in the main page
        window.location.href = "/admin";
    })
})