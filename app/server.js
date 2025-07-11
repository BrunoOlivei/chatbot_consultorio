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

  const regexAgendamento = /((quero|gostaria|desejo|preciso|marcar|data|agendar|agendamento|disponibilidade|para quando|pra quando|quando tem).*(consulta|vaga|hor[áa]rio)?)|((tem|t[eê]m|existe|há).*(vaga|consulta|agendamento|hor[áa]rio|disponibilidade))/i;

  if (msg.includes("valor")) {
    responderWhatsApp(numero, "A consulta particular custa R$650 e pode ser paga via PIX, débito ou crédito.");

  } else if (regexConsultaMarcada.test(msg)) {
    responderWhatsApp(numero, "Claro! Para confirmar o horário da sua consulta, por favor envie seu nome completo e o convênio. Estou encaminhando sua mensagem para a secretária.");
    responderWhatsApp(NUMERO_SECRETARIA, `Paciente ${numero} quer confirmar o horário da consulta. Mensagem: "${msgOriginal}"`);

  } else if (regexAgendamento.test(msg)) {
    responderWhatsApp(numero, "Seja bem-vindo ao canal de atendimento da Doutora Giovana de Moraes. Esse canal é exclusivo para agendamento de consultas para os convênios São Lucas, Irman e Doctor. Você pode visualizar os horários disponíveis e agendar através desse link: https://calendly.com/giovanademoraes/agendamento-de-consultas. Para agendamento de retornos ou procedimentos, me envie uma mensagem que logo te respondo. Para agendamento de consultas particulares, escreva: PARTICULAR.");

  } else if (msg.includes("convênio") || msg.includes("plano") || msg.includes("São Lucas") || msg.includes("Irman") || msg.includes("doctor")) {
    responderWhatsApp(numero, "Dra. Giovana atende os convênios São Lucas Saúde, Irman e Doctor. (Não atendemos Notredame)");

  } else if (
    msg.includes("falar com atendente") ||
    msg.includes("atendimento humano") ||
    msg.includes("preciso de ajuda") ||
    msgOriginal.trim() === "URGENTE" ||
    msg.includes("cirurgia")
  ) {
    responderWhatsApp(numero, "Encaminhei a sua mensagem à secretária responsável. Por favor, envie seu nome completo para que possamos dar continuidade ao atendimento.");
    responderWhatsApp(NUMERO_SECRETARIA, `URGENTE: o número ${numero} solicitou atendimento. Mensagem: "${msgOriginal}"`);

  } else if (
    msg.includes("obrigada") ||
    msg.includes("obrigado")
  ) {
    responderWhatsApp(numero, "Você é sempre bem-vindo(a)! Se surgirem outras perguntas ou se você precisar de informações adicionais no futuro, não hesite em entrar em contato comigo. Estou aqui para ajudá-lo(a). Tenha um ótimo dia!");

  } else if (msg.includes("endereço") ||
     msg.includes("onde fica")       
  ) {
    responderWhatsApp(numero, "Nosso endereço é: Rua Peru, 636 - 5° Andar, Sala 504 - Santo Antonio - Americana. Próximo à Droga Raia da Av. Brasil (esquina de cima). O prédio possui estacionamento rotativo. Link para GPS: https://goo.gl/maps/tqinSqFwtZePzxF89");

  } else if (msg.includes("particular")) {
    responderWhatsApp(numero, "A consulta particular custa R$650 e pode ser paga via PIX, débito ou crédito. Caso deseje agendar envie seu nome completo para que possamos dar continuidade ao atendimento.");
    responderWhatsApp(numero, "Aguarde um momento.");
    responderWhatsApp(NUMERO_SECRETARIA, `O número ${numero} solicitou atendimento sobre consulta particular. Mensagem: "${msgOriginal}"`);

  } else if (
    msg.includes("bom dia") ||
    msg.includes("boa tarde") ||
    msg.includes("olá") ||
    msg.includes("oi") ||
    msg.includes("boa noite")
  ) {
    responderWhatsApp(numero, "Olá! Eu sou a assistente responsável pelos agendamentos da Dra. Giovana. Como posso te ajudar?");

  } else if (
    msg.includes("notredame") ||
    msg.includes("samaritano") ||
    msg.includes("bradesco") ||
    msg.includes("sulamerica") ||
    msg.includes("unimed")
  ) {
    responderWhatsApp(numero, "A Dra. Giovana não atende esse convênio. No momento, só atendemos São Lucas, Irman e Doctor.");

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

