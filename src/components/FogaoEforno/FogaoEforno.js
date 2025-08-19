import React, { useEffect, useState } from 'react';

const FogaoEforno = () => {
    const [produtos, setProdutos] = useState([]);
    const [pesquisa, setPesquisa] = useState("");

    const buscarProdutos = () => {
        fetch(`http://192.168.1.250/server-pascoa/api/produtosforno/${pesquisa}`)
            .then(res => res.json())
            .then(data => setProdutos(data))
            .catch(err => console.error(err));
    };

    const calculoCento = (produtos) => {
        return produtos.map(p => {
            if (p.UNIDADE && p.UNIDADE.trim().toUpperCase() === "CT") {
                return { ...p, L_QUANTIDADE: (p.L_QUANTIDADE || 0) * 100 };
            }
            return p;
        });
    };
    const produtosAjustados = calculoCento(produtos);

    const petiscosFritos = produtosAjustados.filter(p =>
        p.IDX_CLASSIFICACAO &&
        p.IDX_CLASSIFICACAO.toLowerCase().includes('petisco') &&
        p.IDX_CLASSIFICACAO.toLowerCase().includes('fritos')
    );
    const totalPetiscosFritos = petiscosFritos.reduce((acc, p) => acc + (p.L_QUANTIDADE || 0), 0);

    // Petiscos assados
    const petiscosAssados = produtosAjustados.filter(p =>
        p.IDX_CLASSIFICACAO &&
        p.IDX_CLASSIFICACAO.toLowerCase().includes('petisco') &&
        p.IDX_CLASSIFICACAO.toLowerCase().includes('assados')
    );
    const totalPetiscosAssados = petiscosAssados.reduce((acc, p) => acc + (p.L_QUANTIDADE || 0), 0);


    //Pirex 
    const pirex = produtosAjustados.filter(p =>
        p.UNIDADE && p.UNIDADE.toLowerCase().includes('px')
    );
    const totalPirex = pirex.reduce((acc, p) => acc + (p.L_QUANTIDADE || 0), 0);

    // Pão de queijo 
    const paoDeQueijo = produtosAjustados.filter(p =>
        p.DESCRICAO && p.DESCRICAO.toLowerCase().includes('pão de queijo')
    );
    const totalPaoDeQueijo = paoDeQueijo.reduce((acc, p) => acc + (p.L_QUANTIDADE || 0), 0);


    // Produtos acabados PP de assar
    // Filtra produtos acabados com unidade PP e classificação que contém "forno"
    const produtoAcabadoAssarPp = produtosAjustados.filter(p =>
        p.UNIDADE && p.UNIDADE.toLowerCase().includes('pp') &&
        p.IDX_CLASSIFICACAO &&
        p.IDX_CLASSIFICACAO.toLowerCase().includes('forno')
    );
    const totalQtdProdutoAcabadoAssarPp = produtoAcabadoAssarPp.reduce((acc, p) => acc + (p.L_QUANTIDADE || 0), 0);
    const totalItensAcabadosAssarPp = produtoAcabadoAssarPp.length;


    // Filtra os produtos que precisam ser esquentados na panela
    const produtosPanela = produtosAjustados.filter(p => 
        p.IDX_CLASSIFICACAO &&
        p.IDX_CLASSIFICACAO.toLowerCase().includes('fogão') &&
        p.L_QUANTIDADE !== 0
    );

    //Filtra produtos pp De fogao
     const ppFogaoProdutos = produtosAjustados.filter(p => 
        p.IDX_CLASSIFICACAO &&
        p.UNIDADE && p.UNIDADE.toLowerCase().includes('pp') &&
        p.IDX_CLASSIFICACAO.toLowerCase().includes('fogão') &&
        p.L_QUANTIDADE !== 0
    );

    const totalItensAcabadosAssarPpFogão = ppFogaoProdutos.length



    // Cálculo de fornos necessários para assados
    const capacidadeFornoGrande = 2500;
    const capacidadeFornoPequeno = 800;
    let fornosGrandesNecessarios = Math.ceil(totalPetiscosAssados / capacidadeFornoGrande);
    let fornosPequenosNecessarios = Math.ceil(totalPetiscosAssados / capacidadeFornoPequeno);
    let fornoQueVaiUsar = 0;
    let descricaoFornoAdicionado = "";
    var fogoesConvidados = 0;
    var motivosFogao = "";

    // fogoesFritos começa com 1 apenas se houver petiscosFritos ou produtosPanela
    var fogoesFritos = 0;

    let tipoForno = "P";
    const cond1 = produtos.some(p => p.UNIDADE && p.UNIDADE.trim().toUpperCase() === "PP");
    const cond2 = petiscosAssados.length !== 0;
    const cond3 = produtos.some(p => p.UNIDADE && p.UNIDADE.trim().toUpperCase() === "PX");

    // caso haja 2 dessas 3 condiçoes, tipoForno =G
    if ([cond1, cond2, cond3].filter(Boolean).length >= 2) {
        tipoForno = "G";
        descricaoFornoAdicionado += "\n Adicionado forno grande por múltiplas condições (PP, assados, PX). ";
    }

    // se totalPetiscoAssado > 1000 forno = G 
    if(totalPetiscosAssados > 1000){
        tipoForno = "G";
        descricaoFornoAdicionado += "\n Adicionado forno grande por quantidade de petiscos assados > 1000. ";
    }

    // Lógica dos pirex
    var fornoPirex = 0;
    const gruposDeDozePirex = Math.floor(totalPirex / 12);
    const gruposDeSeisPirex = Math.floor(totalPirex / 6);
    if (gruposDeDozePirex) {
        fornoPirex += gruposDeDozePirex;
        descricaoFornoAdicionado += "\n Adicionado " + gruposDeDozePirex + " fornos grandes por conta do pirex. ";
    } else if (gruposDeSeisPirex  && totalPirex < 6) {
        fornoPirex += gruposDeSeisPirex;
        descricaoFornoAdicionado += "\n Adicionado " + gruposDeSeisPirex + " fornos pequenos por conta do pirex. ";
    }

    // Lógica para pão de queijo: se quantidade > 700, adiciona 1 forno grande
    if (totalPaoDeQueijo > 700) {
        fornoQueVaiUsar += 1;
        descricaoFornoAdicionado += "\n Adicionado 1 forno grande pela quantidade de pão de queijo. ";
    }

    // Lógica para fogão: 1 fogão a cada 1500 salgados fritos 
    const fogoesFritosAdicionados = Math.floor(totalPetiscosFritos / 1500);
    fogoesFritos += fogoesFritosAdicionados;
    if (fogoesFritosAdicionados > 0) {
        motivosFogao += `\n Adicionado ${fogoesFritosAdicionados} fogão(ões) por conta de ${totalPetiscosFritos} salgados fritos.`;
    }

    // Calcula a quantidade de fogões necessários (1 para cada 2 produtos, arredondando para cima)
    var fogoesPanela = Math.ceil(produtosPanela.length / 2);
    if (produtosPanela.length > 0) {
        motivosFogao += `\n Adicionado ${fogoesPanela} fogão(ões) para esquentar produtos na panela.`;
    }

    // Lógica para adicionar 1 fogao a cada 100 convidados
    const grupoDe100Conv = Math.floor(
        Array.isArray(produtos) && produtos.length > 0 && produtos[0].CONVIDADOS ? produtos[0].CONVIDADOS / 100 : 0
    );
    if(grupoDe100Conv){
        fogoesConvidados += 1;
        fogoesPanela *= fogoesConvidados;
        motivosFogao += `\n Adicionado fogão extra por grupo de 100 convidados.`;
    }
    
    
// Soma total de fogões
    var fogoes = fogoesFritos + fogoesPanela;

    // Lógica de fornos para produtos acabados PP de assar
    // Se a quantidade total convidados for menor que 150, adiciona 1 forno a cada 2 produtos acabados
    // Se convidados maior ou igual a 150, adiciona 1 forno por produto acabado

    const convidados = Array.isArray(produtos) && produtos.length > 0 ? produtos[0].CONVIDADOS : 0;
    var fornosQuantidadePpAssar = 0;
    if (convidados < 150) {
        fornosQuantidadePpAssar = Math.floor(totalItensAcabadosAssarPp / 2);
    } else {
        // Para convidados >= 150 (inclui exatamente 150)
        fornosQuantidadePpAssar = totalItensAcabadosAssarPp;
    }

    //adicionar pelo menos 1 forno lógica
    if(tipoForno === "G" && totalPaoDeQueijo !== 0 && fornosGrandesNecessarios === 0){
        fornoQueVaiUsar += 1;
    } else if(tipoForno === "P" && totalPaoDeQueijo !== 0 && fornosPequenosNecessarios === 0){
         fornoQueVaiUsar += 1;
    }
        
    if (tipoForno === "G" && produtoAcabadoAssarPp.length > 0 && fornosQuantidadePpAssar === 0 && fornosGrandesNecessarios === 0) {
        fornosQuantidadePpAssar += 1;
    }
    else if (tipoForno === "P" && produtoAcabadoAssarPp.length > 0 && fornosQuantidadePpAssar === 0 && fornosPequenosNecessarios === 0) {
        fornosQuantidadePpAssar += 1;
    }
     //adicionando 1 produto pirex se o total de pirex nao for 0 mas nao entrar nas 2 regras acima 
    if (tipoForno === "G" && pirex && totalPirex !== 0 && fornosGrandesNecessarios ===0){
        fornoPirex += 1;
        descricaoFornoAdicionado += "\n Adicionado 1 forno por conta do pirex. ";
    } else  if (tipoForno === "P" && pirex && totalPirex !== 0 && fornosPequenosNecessarios ===0){
        fornoPirex += 1;
        descricaoFornoAdicionado += "\n Adicionado 1 forno por conta do pirex. ";
    }
    

    // Lógica para remover fornos desnecessários
    if (tipoForno === 'G') {
        fornosPequenosNecessarios = 0;
        fornosGrandesNecessarios += fornosQuantidadePpAssar + fornoPirex
        fornoQueVaiUsar += fornosGrandesNecessarios
        fornosGrandesNecessarios = fornoQueVaiUsar

    } else {
        fornosGrandesNecessarios = 0;
        fornosPequenosNecessarios += fornosQuantidadePpAssar + fornoPirex
        fornoQueVaiUsar += fornosPequenosNecessarios
        fornosPequenosNecessarios = fornoQueVaiUsar
    
    }


    return (
        <div className="container mt-4">
            <h2>Produtos</h2>
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Digite o número do orçamento"
                    value={pesquisa}
                    onChange={e => setPesquisa(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            buscarProdutos();
                        }
                    }}
                    style={{ maxWidth: "300px" }}
                />
            </div>
            <button className="btn btn-primary mt-2" onClick={buscarProdutos}>
                Buscar
            </button>
            <div style={{ marginTop: '8px' }}>
                <strong>Total de fornos grandes necessários:</strong> {fornosGrandesNecessarios}
            </div>
            <div style={{ marginTop: '8px' }}>
                <strong>Quantidade de fornos pequenos necessários: </strong> {fornosPequenosNecessarios}
            </div>
            <div style={{ marginTop: '8px' }}>
                <strong>Total de fogões necessários:</strong> {fogoes}
            </div>
            <hr></hr>
            <div style={{ marginTop: '8px' }} >
                    <strong>Resumo dos produtos:</strong>
                    <div><strong>Petiscos fritos:</strong> {Math.round(totalPetiscosFritos)}</div>
                    <div><strong>Petiscos assados:</strong> {Math.round(totalPetiscosAssados)}</div>
                    <div><strong>Pães de queijo:</strong> {Math.round(totalPaoDeQueijo)}</div>
                    <div><strong>Quantidade de pirex (PX):</strong> {Math.round(totalPirex)}</div>
                    <div><strong>Produto PP que vai ao forno: </strong> {totalItensAcabadosAssarPp}</div>
                    <div><strong>Produto PP que vai ao fogão: </strong>{totalItensAcabadosAssarPpFogão}</div>
             </div>
             <hr></hr>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Documento</th>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Quantidade</th>
                        <th>Classificação</th>
                        <th>PK DoctoPed</th>
                        <th>Unidade</th>
                        <th>Convidados</th>
                    </tr>
                </thead>
                <tbody>
                    {produtos.map((produto, idx) => (
                        <tr key={idx}>
                            <td>{produto.DOCUMENTO || '-'}</td>
                            <td>{produto.NOME || '-'}</td>
                            <td>{produto.DESCRICAO || '-'}</td>
                            <td>{produto.L_QUANTIDADE != null ? produto.L_QUANTIDADE : '-'}</td>
                            <td>{produto.IDX_CLASSIFICACAO || '-'}</td>
                            <td>{produto.PK_DOCTOPED || '-'}</td>
                            <td>{produto.UNIDADE || '-'}</td>
                            <td>{produto.CONVIDADOS || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4">
                <hr></hr>
            </div>
        </div>
    );
};

export default FogaoEforno;