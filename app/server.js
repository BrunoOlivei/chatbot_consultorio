const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const INSTANCE_ID = process.env.INSTANCE_ID;
const TOKEN = process.env.TOKEN;
const NUMERO_SECRETARIA = process.env.NUMERO_SECRETARIA;

function responderWhatsApp(para, texto) {
  axios.post(`https://api.ultramsg.com/${INSTANCE_ID}/messages/chat`, {
    token: TOKEN,
    to: para,
    body: texto
  }).then(() => {
    console.log("✅ Resposta enviada para:", para);
  }).catch((err) => {
    console.error("❌ Erro ao enviar resposta:", err.message);
  });
}

app.use(bodyParser.json());

app.post("/webhook-ultramsg", (req, res) => {
  console.log("🧾 Corpo da requisição recebida:");
  console.log(JSON.stringify(req.body, null, 2));

  const msg = req.body.data?.body?.toLowerCase() || "";
  const msgOriginal = req.body.data?.body || "";
  const numero = req.body.data?.from?.replace("@c.us", "") || "NÚMERO_INDEFINIDO";

  console.log(`📩 Mensagem recebida de: ${numero}`);

  const regexConsultaMarcada = /(qual|confirmar|meu).*?(hor[áa]rio|agendamento|consulta|marcada)/i;

  const regexPerguntaConvenios = /(qual|quais|que).*?(convenios|convenio|plano|convênio|convênios|planos)/i;
  const regexCoveniosNaoAtendidos = /(notredame|notre dame|hapvida|hap vida|unimed|samaritano|sulamerica|sul america|sul américa|sulamérica|bradesco)/i;

  const regexAgendamento = /((quero|gostaria|desejo|preciso|marcar|data|agendar|agendamento|disponibilidade|para quando|pra quando|quando tem).*(consulta|vaga|hor[áa]rio)?)|((tem|t[eê]m|existe|há).*(vaga|consulta|agendamento|hor[áa]rio|disponibilidade))/i;


  if (    
    msg.includes("bom dia") ||
    msg.includes("boa tarde") ||
    msg.includes("olá") ||
    msg.includes("oi") ||
    msg.includes("boa noite")
  ) {
      responderWhatsApp(
        numero,
        "Olá! Eu sou a assistente responsável pelos agendamentos da Dra. Giovana.\n\n"
      ).then(() => {
        return responderWhatsApp(
          numero,
          "1️⃣ Para agendamentos de consultas pelos planos São Lucas ou Irman, digite *1*\n\n" + 
          "2️⃣ Para agendamentos de consultas pelo Doctor, digite *2*\n\n" +
          "3️⃣ Para agendamentos de consultas particulares, digite *3*\n\n" + 
          "4️⃣ Para saber o horário da sua consulta já agendada, digite *4*\n\n" + 
          "5️⃣ Para saber o endereço do consultório, digite *5*\n\n" + 
          "6️⃣ Para saber o valor da consulta particular, digite *6*\n\n" +
          "7️⃣ Para saber quais convênios a Dra. Giovana atende, digite *7*\n\n" + 
          "8️⃣ Para agendamento de avaliação para cirurgias (com encaminhamento médico), digite *8*\n\n" +
          "9️⃣ Para falar com a secretária, digite *9*"
        );
      });
  }
  
  /* Opção 1 - Para agendamentos de consultas pelos planos São Lucas ou Irman, digite 1 */
  else if (
    msg.includes("um") ||
    msg.includes("digite 1") ||
    msg.includes("1") ||
    (
      msg.includes("agendamento") || msg.includes("agendar")
    )
    & (
      msg.includes("são lucas") ||
      msg.includes("sao lucas") ||
      msg.includes("irman") ||
      msg.includes("irma") ||
      msg.includes("irmam")
    )
  ) {
    responderWhatsApp(
      numero,
      "Esse canal é exclusivo para agendamento de consultas para os convênios São Lucas e Irman. Você pode visualizar os horários disponíveis e agendar através desse link: https://calendly.com/giovanademoraes/agendamento-de-consultas. \n Caso não haja horários disponíveis no momento, isso significa que nossa agenda está lotada. Recomendamos tentar novamente em alguns dias. Normalmente, novos horários são disponibilizados todas as segundas e quartas-feiras pela manhã."
    )
  }

  /* Opção 2 - Para agendamentos de consultas pelo Doctor, digite 2*/
  else if (
    msg.includes("dois") ||
    msg.includes("digite 2") ||
    msg.includes("2") ||
    (
      msg.includes("agendamento") || msg.includes("agendar")
    )
    & (
      msg.includes("doctor") ||
      msg.includes("doc")
    )
  ) {
    responderWhatsApp(
      numero,
      "Esse canal é exclusivo para agendamento de consultas para os convênios Doctor. Você pode visualizar os horários disponíveis e agendar através desse link: https://calendly.com/giovanademoraes/consulta-convenio-1. \n Caso não haja horários disponíveis no momento, isso significa que nossa agenda está lotada. Recomendamos tentar novamente em alguns dias. Normalmente, novos horários são disponibilizados todas as segundas e quartas-feiras pela manhã."
    )
  }

  /* Opção 3 - Para agendamentos de consultas particulares, digite 3*/
  else if (
    msg.includes("tres") ||
    msg.includes("três") ||
    msg.includes("digite 3") ||
    msg.includes("3") ||
    (
      msg.includes("agendamento") || msg.includes("agendar")
    )
    & (
      msg.includes("particular")
    )
  ) {
    responderWhatsApp(
      numero,
      "Esse canal é exclusivo para agendamento de consultas Particulares. Você pode visualizar os horários disponíveis e agendar através desse link: https://calendly.com/giovanademoraes/agendamento. \n Caso não haja horários disponíveis no momento, isso significa que nossa agenda está lotada. Recomendamos tentar novamente em alguns dias. Normalmente, novos horários são disponibilizados todas as segundas e quartas-feiras pela manhã."
    )
  }

  /* Opção 4 - Para saber o horário da sua consulta já agendada, digite 4*/ 
  else if (
    msg.includes("quatro") ||
    msg.includes("digite 4") ||
    msg.includes("4") ||
    regexConsultaMarcada.test(msg)
  ) {
    responderWhatsApp(numero, "Claro! Para confirmar o horário da sua consulta, por favor envie seu nome completo e o convênio. Aguarde que logo retornarei com sua confirmação.");
    responderWhatsApp(NUMERO_SECRETARIA, `Paciente ${numero} quer confirmar o horário da consulta. Mensagem: "${msgOriginal}"`);
  }

  /* Opção 5 - Para saber o endereço do consultório, digite 5*/
  else if (
    msg.includes("cinco") ||
    msg.includes("digite 5") ||
    msg.includes("5") ||
    msg.includes("endereço") ||
    msg.includes("endereco") ||
    msg.includes("onde fica")   
  ) {
    responderWhatsApp(numero, "Nosso endereço é: Rua Peru, 636 - 5° Andar, Sala 504 - Santo Antonio - Americana. Próximo à Droga Raia da Av. Brasil (esquina de cima). O prédio possui estacionamento rotativo. Link para GPS: https://goo.gl/maps/tqinSqFwtZePzxF89");
  }

  /* Opção 6 - Para saber o valor da consulta particular, digite 6*/
  else if (
    msg.includes("seis") ||
    msg.includes("digite seis") ||
    msg.includes("6") ||
    msg.includes("valor")
  ) {
    responderWhatsApp(numero, "O valor da consulta particular é R$650 e pode ser paga via PIX, débito ou crédito.");
  }
  
  /* Opção 7 - Para saber quais convênios a Dra. Giovana atende, digite 7*/
  else if (
    msg.includes("sete") ||
    msg.includes("digite 7") ||
    msg.includes("7") ||
    regexPerguntaConvenios.test(msg)
  ) {
    responderWhatsApp(numero, "Atendemos aos convênios: \n- São Lucas, \n- Irmam, \n- Doctor");
  }

  /* Opção 8 - Para agendamento de avaliação para cirurgias (com encaminhamento médico), digite 8*/

  else if (
    msg.includes("oito") ||
    msg.includes("digite 8") ||
    msg.includes("8") ||
    (
      (
        msg.includes("avaliação") ||
        msg.includes("avaliaçao") ||
        msg.includes("avaliacão") ||
        msg.includes("avaliacao")
      ) &
      (
        msg.includes("cirurgia") ||
        msg.includes("cirurgias")
      )
    )
  ) {
    responderWhatsApp(numero, "Encaminhei a sua mensagem à secretária responsável. Por favor, envie seu nome completo para que possamos dar continuidade ao atendimento. \nAs mensagens serão respondidas dentro do prazo de 24 horas úteis, durante horário comercial")
    responderWhatsApp(NUMERO_SECRETARIA, `O número ${numero} solicitou atendimento sobre avaliação de cirurgia. Mensagem: "${msgOriginal}"`);
  }

  /* Opção 9 - Para falar com a secretária, digite 9*/
  else if (
    msg.includes("nove") ||
    msg.includes("digite 9") ||
    msg.includes("9") ||
    msg.includes("preciso de ajuda") ||
    (
      (
        msg.includes("falar") ||
        msg.includes("atendimento")
      ) &
      (
          msg.includes("secretaria") ||
          msg.includes("secretária") ||
          msg.includes("atendente") ||
          msg.includes("humano") ||
          msg.includes("alguem") ||
          msg.includes("alguém")
      ) &
      msg.includes("urgente")
    )
  ) {
    responderWhatsApp(numero, "Encaminhei a sua mensagem à secretária responsável. Por favor, envie seu nome completo para que possamos dar continuidade ao atendimento. \nAs mensagens serão respondidas dentro do prazo de 24 horas úteis, durante horário comercial");
    responderWhatsApp(NUMERO_SECRETARIA, `URGENTE: o número ${numero} solicitou atendimento. Mensagem: "${msgOriginal}"`);
  }

  /* Resposta para convênios não assistidos */
  else if (
    regexCoveniosNaoAtendidos.test(msg)
  ) {
    responderWhatsApp(numero, "A Dra. Giovana não atende esse convênio. No momento, só atendemos São Lucas, Irman e Doctor.");
  }

  /* Mensagem de agradecimento */
  else if (
    msg.includes("obrigada") ||
    msg.includes("obrigado")
  ) {
    responderWhatsApp(numero, "Você é sempre bem-vindo(a)! Se surgirem outras perguntas ou se você precisar de informações adicionais no futuro, não hesite em entrar em contato comigo. Estou aqui para ajudá-lo(a). Tenha um ótimo dia!");

  } 
  
  else if (msg.includes("particular")) {
    responderWhatsApp(numero, "O valor da consulta particular é R$650 e pode ser paga via PIX, débito ou crédito. Caso deseje agendar envie seu nome completo para que possamos dar continuidade ao atendimento.");
    responderWhatsApp(numero, "Aguarde um momento.");
    responderWhatsApp(NUMERO_SECRETARIA, `O número ${numero} solicitou atendimento sobre consulta particular. Mensagem: "${msgOriginal}"`);

  } else {
    responderWhatsApp(numero, "Recebemos sua mensagem! Em breve retornaremos com mais informações.");
    responderWhatsApp(NUMERO_SECRETARIA, `Mensagem encaminhada: o número ${numero} enviou: "${msgOriginal}"`);
  }

  res.status(200).send({ status: "mensagem processada" });
});

app.get("/", (req, res) => {
  res.send("✅ Webhook do bot da Dra. Giovana está ativo!");
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});

