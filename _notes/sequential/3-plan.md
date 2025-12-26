# Plan

Let's start with:

1. Ease of development
2. Enlist tasks
3. Local test method
4. Deploy

## 1. Ease of Development

For easy development, There's need to develop a "Unpack & Pack Script". So that:
- we can split project into dirs and files like [8-unpack-structure/](8-unpack-structure)
- and after changes, can pack it again into single xml file.

## 2. Enlist Tasks

1. Boxes ReDesign
2. Navigation Problem

That's it for now

## 3. Local test method

There are two solutions.

Solution-1:
- We need a code that will take theme xml as input
- and it will render a sample page
- so that we can make changes to xml and quickly use this script to generate preview.html and use it at loca.

Solution-2:
- Let's just use `wget` to download a page.
- and directly make changes to this html file
- and preview in browser.
- after changes are confirmed or verified.
- Then lets refactor those changes into XML.

Using solution #2 for saving time.
If many more tasks are expected from client in future.
Then solution #1 is required.

## 4. Deploy

XML will be uploaded directly on blogger to deploy.