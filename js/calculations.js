export function velocidad40(t) {
return 36.58 / t;
}


export function aceleracion10(t) {
return 9.14 / t;
}


export function explosividad(salto, peso) {
return (salto * peso) / 100;
}


export function agilidad(pro, cone) {
return 100 / (pro + cone);
}