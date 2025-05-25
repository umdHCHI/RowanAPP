
# Frontend Setup - Gamified Wellness App: *The Archive*

Welcome to the frontend codebase for **The Archive**, a narrative-based stress management app for college students built with **React Native** and **Expo**.

---

##  Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/frontend.git
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npx expo start
   ```

4. Install Expo Go on your mobile device to test.

---

##  Folder Structure

```
/frontend
├── assets/
├── components/
├── screens/
├── navigation/
├── utils/
├── App.tsx
```

---

##  Week 1–3 Tasks (Motiffdesign Screens)

- [ ] **Home Screen** – introduction + avatar overview  
  🔗 Tutorial: [Create a Splash and Home Screen in Expo](https://www.freecodecamp.org/news/how-to-build-a-react-native-app-and-integrate-it-with-firebase/)

- [ ] **Character Select Screen** – choose narrative archetype  
  🔗 Tutorial: [React Native Character Select Grid](https://blog.logrocket.com/build-character-selection-screen-react-native/)

- [ ] **Story Scene** – narrative text + choices from JSON  
  🔗 Tutorial: [Render Branching Dialog Trees](https://www.youtube.com/watch?v=Ua9a1zXVe4I)

- [ ] **Reflection Prompt Screen** – user journals or selects emotion  
  🔗 Tutorial: [React Native Forms and Mood Trackers](https://www.youtube.com/watch?v=zvYgPlY_6f8)

- [ ] Use mock JSON data for choices before API integration

- [ ] Style components with Flexbox and Tailwind or styled-components  
  🔗 Tutorial: [Tailwind in React Native](https://dev.to/vonheikemen/using-tailwindcss-in-react-native-2023-3p4o)

- [ ] Implement navigation with React Navigation (tab + stack)  
  🔗 Tutorial: [React Navigation Setup](https://reactnavigation.org/docs/hello-react-navigation)

---

##  Testing and Debugging

- Use **Expo Go** for mobile testing
- Use **React Native Debugger** or browser tools
- Enable fast refresh + hot reload in development

---

##  Tips

- Use component-based design (e.g., `CharacterCard`, `StoryPanel`)
- Keep props simple and focused (data comes from context or JSON)
- Design for flexibility: not all users will follow the same path
- Write components to be tested with both static and dynamic props

---

