const tags = require("../utils/database.js").tags;
const config = require("../config.json");
const client = require("../utils/client.js");
const paginator = require("../utils/pagination/pagination.js");
const { random } = require("../utils/misc.js");

exports.run = async (message, args) => {
  const blacklist = ["add", "edit", "remove", "delete", "list", "random"];
  switch (args[0].toLowerCase()) {
    case "add":
      if (args[1] === undefined) return `${message.author.mention}, you need to provide the name of the tag you want to add!`;
      if (blacklist.indexOf(args[1].toLowerCase()) > -1) return `${message.author.mention}, you can't make a tag with that name!`;
      if (tags.has(message.channel.guild.id, args[1].toLowerCase())) return `${message.author.mention}, this tag already exists!`;
      await setTag(args.slice(2).join(" "), args[1].toLowerCase(), message);
      return `${message.author.mention}, the tag \`${args[1].toLowerCase()}\` has been added!`;
    case "delete":
    case "remove":
      if (args[1] === undefined) return `${message.author.mention}, you need to provide the name of the tag you want to delete!`;
      if (!tags.has(message.channel.guild.id, args[1].toLowerCase())) return `${message.author.mention}, this tag doesn't exist!`;
      if (tags.get(message.channel.guild.id, args[1].toLowerCase()).author !== message.author.id && tags.get(message.channel.guild.id, args[1].toLowerCase()).author !== config.botOwner) return `${message.author.mention}, you don't own this tag!`;
      tags.delete(message.channel.guild.id, args[1].toLowerCase());
      return `${message.author.mention}, the tag \`${args[1].toLowerCase()}\` has been deleted!`;
    case "edit":
      if (args[1] === undefined) return `${message.author.mention}, you need to provide the name of the tag you want to edit!`;
      if (!tags.has(message.channel.guild.id, args[1].toLowerCase())) return `${message.author.mention}, this tag doesn't exist!`;
      if (tags.get(message.channel.guild.id, args[1].toLowerCase()).author !== message.author.id && tags.get(message.channel.guild.id, args[1].toLowerCase()).author !== config.botOwner) return `${message.author.mention}, you don't own this tag!`;
      await setTag(args.slice(2).join(" "), args[1].toLowerCase(), message);
      return `${message.author.mention}, the tag \`${args[1].toLowerCase()}\` has been edited!`;
    case "list":
      if (!message.channel.guild.members.get(client.user.id).permission.has("addReactions") && !message.channel.permissionsOf(client.user.id).has("addReactions")) return `${message.author.mention}, I don't have the \`Add Reactions\` permission!`;
      if (!message.channel.guild.members.get(client.user.id).permission.has("embedLinks") && !message.channel.permissionsOf(client.user.id).has("embedLinks")) return `${message.author.mention}, I don't have the \`Embed Links\` permission!`;
      var pageSize = 15;
      var embeds = [];
      var groups = Object.keys(tags.get(message.channel.guild.id)).map((item, index) => {
        return index % pageSize === 0 ? Object.keys(tags.get(message.channel.guild.id)).slice(index, index + pageSize) : null;
      }).filter((item) => {
        return item;
      });
      for (const [i, value] of groups.entries()) {
        embeds.push({
          "embed": {
            "title": "Tag List",
            "color": 16711680,
            "footer": {
              "text": `Page ${i + 1} of ${groups.length}`
            },
            "description": value.join("\n"),
            "author": {
              "name": message.author.username,
              "icon_url": message.author.avatarURL
            }
          }
        });
      }
      if (embeds.length === 0) return `${message.author.mention}, I couldn't find any tags!`;
      return paginator(message, embeds);
    case "random":
      return tags.get(message.channel.guild.id, random(Object.keys(tags.get(message.channel.guild.id)))).content;
    default:
      if (args.length === 0) return `${message.author.mention}, you need to specify the name of the tag you want to view!`;
      if (!tags.has(message.channel.guild.id, args[0].toLowerCase())) return `${message.author.mention}, this tag doesn't exist!`;
      return tags.get(message.channel.guild.id, `${args[0].toLowerCase()}.content`);
  }
};

const setTag = async (content, name, message) => {
  if (content === undefined || content.length === 0) return `${message.author.mention}, you need to provide the content of the tag!`;
  if (message.attachments.length !== 0) {
    tags.set(message.channel.guild.id, { content: `${content} ${message.attachments[0].url}`, author: message.author.id }, name);
  } else {
    tags.set(message.channel.guild.id, { content: content, author: message.author.id }, name);
  }
};

exports.aliases = ["t", "tag", "ta"];