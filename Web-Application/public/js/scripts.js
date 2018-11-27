const token = document.getElementsByName("t")[0].value

if(token !== "" && (!localStorage.getItem('t') || localStorage.getItem('t') == ""))
{
    localStorage.setItem('t', token);
}