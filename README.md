# Pinnacle RCS Business Messaging Visualizer

## View & Send RCS Messages in VSCode

![Example](https://i.ibb.co/Y0tw0Bv/Screenshot-2024-11-28-at-6-27-44-PM.png)

## Quick Start Guide

- Create a new json file with the following format:

`test.rcs.json`

```json
{
  "to": "+16287261512",
  "from": "test",
  // "text": "Hello, world!", <- You can choose to add text or cards but not both
  "cards": [
    {
      "title": "Who is the coolest?",
      "subtitle": "Jeffery is super cool and has skinny legs.",
      "mediaUrl": "https://static.boredpanda.com/blog/wp-content/uploads/2018/06/These-dogs-look-extremely-cute-after-going-to-a-salon-in-Japan-5b28b8862ec5b__700.jpg",
      "buttons": [
        {
          "title": "I vote Jeffery",
          "type": "trigger",
          "payload": "JEFFERY"
        }
      ]
    },
    {
      "title": "Who is the coolest?",
      "subtitle": "Hank is also super cool and has a nice beard.",
      "mediaUrl": "https://pbs.twimg.com/media/FxfOvxeaQAAEHVy.jpg",
      "buttons": [
        {
          "title": "I vote Hank",
          "type": "trigger",
          "payload": "HANK"
        }
      ]
    },
    {
      "title": "Who is the coolest?",
      "subtitle": "Mohu was known as the cutest dog in the world for being round.",
      "mediaUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN3kvclcCPoOGpTKnWEB9gUnjTfSwOskb2Hg&s&raw=1",
      "buttons": [
        {
          "title": "I vote Mohu",
          "type": "trigger",
          "payload": "MOHU"
        }
      ]
    }
  ],
  "quickReplies": [
    {
      "title": "I can't decide",
      "type": "trigger",
      "payload": "CANNOT_DECIDE"
    },
    {
      "title": "Opt out",
      "type": "trigger",
      "payload": "OPT_OUT"
    }
  ]
}
```

- Open the RCS Visualizer by `shift + cmd + p` and typing `RCS: Show Panel`
- Select the `test.rcs.json` file you created
- Add your API Key (or autodetect by adding PINNACLE_API_KEY to your .env file)
- Click on the `Send` button to send the message
