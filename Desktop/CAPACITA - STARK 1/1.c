int main() {
    int ano;

    printf("Digite um ano: ");
    scanf("%d", &ano);
    
    // Critérios para ano bissexto:
    // - O ano deve ser divisível por 4
    // - MAS se ele for divisível por 100, ele só será bissexto se também
    // for divisível por 400
    // Ex: 2000 é bissexto (divisível por 400), mas 1900 não é (divisível
    // por 100, mas não por 400)
    if((ano % 4 == 0 && ano % 100 != 0) || (ano % 400 == 0)) {
    printf("%d eh um ano bissexto.\n", ano);
} else {
    printf("%d nao eh um ano bissexto.\n", ano);
    }
    return 0;
}