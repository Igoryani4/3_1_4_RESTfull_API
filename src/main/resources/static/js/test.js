
$(async function () {
    await getTableWithUser();
})



const userFetchService = {
    head: {
        'Accept': 'application/json',
        'Type': 'application/json',
        'Referer': null
    },
    findThisUser: async () => await fetch(`api/this_user`),
}

const emeilAutority = document.getElementById("email_aut");
const roleAuthority =document.getElementById("role_auth");
const btnAdmin =document.getElementById("btnAdmin");

async function getTableWithUser() {
    let table = $('#mainTableWithUser tbody');
    table.empty();


    await userFetchService.findThisUser()
        .then(res => res.json())
        .then(user => {
            emeilAutority.textContent = user.email
            roleAuthority.textContent = user.role[0].title
            if (user.role[0].title !== 'ROLE_ADMIN'){
                btnAdmin.className = "no-click"
                btnAdmin.className = "text-white"
            }
            let tableFilling = `$(
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.password.slice(0, 15)}...</td>
                        <td>${user.role[0].title}</td>
                       
                    </tr>
            )`;
            table.append(tableFilling);
        })

}


