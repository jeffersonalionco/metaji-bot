const groupMetadataCache = new Map();
const lidCache = new Map();

const handler = async (m, {conn, participants, command, usedPrefix, text}) => {
  const datas = global

  const texto1 = ['_*< GRUPOS - ELIMINAR />*_\n\n*[ ℹ️ ] O dono do bot ativou a função de restrição', 'por isso o comando solicitado não foi executado.*'];
  if (!global.db.data.settings[conn.user.jid].restrict) throw `${texto1[0]} (*_restrict_*), ${texto1[1]}`;

  const kicktext = `_*< GRUPOS - ELIMINAR />*_\n\n*[ ℹ️ ] Marque ou responda a uma mensagem do participante que deseja remover.*\n\n*[ 💡 ] Exemplo:* _${usedPrefix + command} @${global.suittag}_`;

  const getMentionedUserAndReason = async () => {
    let mentionedJid = null;
    let reason = null;
    const mentionedJids = await m.mentionedJid;

    if (mentionedJids && mentionedJids.length > 0) {
      mentionedJid = mentionedJids[0];
      if (text) {
        const textAfterMention = text.replace(/@\d+/g, '').trim();
        if (textAfterMention) {
          reason = textAfterMention;
        }
      }
    } else if (m.quoted && m.quoted.sender) {
      mentionedJid = m.quoted.sender;
      if (text && text.trim()) {
        reason = text.trim();
      }
    } else if (m.message?.extendedTextMessage?.contextInfo) {
      const contextInfo = m.message.extendedTextMessage.contextInfo;
      if (contextInfo.mentionedJid && contextInfo.mentionedJid.length > 0) {
        mentionedJid = contextInfo.mentionedJid[0];
        if (text) {
          const textAfterMention = text.replace(/@\d+/g, '').trim();
          if (textAfterMention) {
            reason = textAfterMention;
          }
        }
      } else if (contextInfo.participant) {
        mentionedJid = contextInfo.participant;
        if (text && text.trim()) {
          reason = text.trim();
        }
      }
    }

    if (!mentionedJid) return { user: null, reason: null };
    const resolvedJid = await resolveLidToRealJid(mentionedJid, conn, m.chat);
    return { user: resolvedJid, reason: reason };
  };

  const { user: mentionedUser, reason: kickReason } = await getMentionedUserAndReason();
  if (!mentionedUser) return m.reply(kicktext, m.chat, {mentions: conn.parseMention(kicktext)});
  if (conn.user.jid.includes(mentionedUser)) return m.reply(`_*< GRUPOS - ELIMINAR />*_\n\n*[ ℹ️ ] O bot não pode se remover.*`);

  if (kickReason) {
    const userTag = mentionedUser.split('@')[0];
    const reasonMessage = `╭─⬣「 🚫 *ADVERTÊNCIA* 🚫 」⬣\n│\n├❯ *Usuário:* @${userTag}\n├❯ *Ação:* Expulsão do grupo\n├❯ *Motivo:* ${kickReason}\n├❯ *Admin:* @${m.sender.split('@')[0]}\n│\n╰─⬣ *Até logo!* ⬣`;

    await conn.sendMessage(m.chat, {
      text: reasonMessage,
      mentions: [mentionedUser, m.sender]
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  try {
    const response = await conn.groupParticipantsUpdate(m.chat, [mentionedUser], 'remove');
    const userTag = mentionedUser.split('@')[0];
    const texto5 = ['_*< GRUPOS - ELIMINAR />*_\n\n*[ ℹ️ ] O participante', 'foi removido.*'];
    const texto6 = ['_*< GRUPOS - ELIMINAR />*_\n\n*[ ℹ️ ]', 'é o dono do grupo, por isso não pode ser removido.*'];
    const texto7 = ['_*< GRUPOS - ELIMINAR />*_\n\n*[ ℹ️ ]', 'já foi removido ou saiu do grupo.*'];
    const exitoso1 = `${texto5[0]} @${userTag} ${texto5[1]}`;
    const error1 = `${texto6[0]} @${userTag} ${texto6[1]}`;
    const error2 = `${texto7[0]} @${userTag} ${texto7[1]}`;
    const texto8 = `_*< GRUPOS - ELIMINAR />*_\n\n*[ ℹ️ ] Ocorreu um erro. Por favor, tente novamente mais tarde.*`;

    if (response[0]?.status === '200') {
      m.reply(exitoso1, m.chat, {mentions: conn.parseMention(exitoso1)});
    } else if (response[0]?.status === '406') {
      m.reply(error1, m.chat, {mentions: conn.parseMention(error1)});
    } else if (response[0]?.status === '404') {
      m.reply(error2, m.chat, {mentions: conn.parseMention(error2)});
    } else {
      conn.sendMessage(m.chat, {text: texto8, mentions: [m.sender], contextInfo: {forwardingScore: 999, isForwarded: true}}, {quoted: m});
    }
  } catch (error) {
    conn.sendMessage(m.chat, {text: `_*< GRUPOS - ELIMINAR />*_\n\n*[ ℹ️ ] Ocorreu um erro. Por favor, tente novamente mais tarde.*`, mentions: [m.sender], contextInfo: {forwardingScore: 999, isForwarded: true}}, {quoted: m});
  }
};

handler.help = ['kick'];
handler.tags = ['group'];
handler.command = /^(kick|expulsar|eliminar|echar|sacar)$/i;
handler.admin = handler.group = handler.botAdmin = true;

export default handler;

async function resolveLidToRealJid(lid, conn, groupChatId, maxRetries = 3, retryDelay = 1000) {
    const inputJid = lid?.toString();

    if (!inputJid || !inputJid.endsWith("@lid") || !groupChatId?.endsWith("@g.us")) {
        return inputJid?.includes("@") ? inputJid : `${inputJid}@s.whatsapp.net`;
    }

    if (lidCache.has(inputJid)) return lidCache.get(inputJid);

    const lidToFind = inputJid.split("@")[0];
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            let metadata;
            if (groupMetadataCache.has(groupChatId)) {
                metadata = groupMetadataCache.get(groupChatId);
            } else {
                metadata = await conn?.groupMetadata(groupChatId);
                if (metadata) {
                    groupMetadataCache.set(groupChatId, metadata);
                    setTimeout(() => groupMetadataCache.delete(groupChatId), 300000);
                }
            }

            if (!metadata?.participants) throw new Error("No se obtuvieron participantes");

            for (const participant of metadata.participants) {
                try {
                    if (!participant?.jid) continue;
                    const contactDetails = await conn?.onWhatsApp(participant.jid);
                    if (!contactDetails?.[0]?.lid) continue;
                    const possibleLid = contactDetails[0].lid.split("@")[0];
                    if (possibleLid === lidToFind) {
                        lidCache.set(inputJid, participant.jid);
                        return participant.jid;
                    }
                } catch (e) { continue }
            }

            lidCache.set(inputJid, inputJid);
            return inputJid;

        } catch (error) {
            if (++attempts >= maxRetries) {
                lidCache.set(inputJid, inputJid);
                return inputJid;
            }
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
    }

    return inputJid;
}
