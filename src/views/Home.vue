<template>
  <div class="home">
    <article>
      <h3>How to</h3>
      <ul>
        <li>
          Use the sidebar to select a Lab. "Active" labs are the ones I'm
          working on.
        </li>
        <li>
          Use the VR button to try the lab on a headset. Most labs are made for
          VR amd may not make sense outside of VR.
        </li>
        <li>
          Toggle the Lab Menu (Oculus Y button) to view Lab Notes and other menu
          options.
        </li>
      </ul>
      <h3>A few notes</h3>
      <p>Everything about this project is a work in progress.</p>
      <p>
        This loosely structured project is a place where I can prototype and
        experiment with UI/UX for spatial interfaces. Some of my ideas include:
      </p>

      <ul>
        <li>
          Using Babylon JS with the Vue 3 Composition API and script setup
        </li>
        <li>Reactive data on Babylon JS GUI</li>
        <li>Reactive/interactive controls with Babylon JS GUI</li>
        <li>
          Laying out data in 3D Building controls for common data editing tasks
        </li>
        <li>
          Navigating data as if each record were an object in 3D Exploring
          productive workflows
        </li>
        <li>
          Replacing some of the flat-screen work that I do in various apps and
          sites
        </li>
        <li>Working with various APIs and databases</li>
        <li>Detailing and documenting common Babylon GUI workflows</li>
      </ul>

      <p>
        The unit of account for this project is the <em>lab</em>. Each lab is a
        place where I can explore a concept or idea. In Vue terms, each lab will
        be a page or component that we can navigate to. I won’t write a post for
        every lab.
      </p>
      <p>Each lab contains a Babylon JS scene, a title, and some notes.</p>
      <p>
        Check the code for each lab for more details. The repo is
        <a href="https://github.com/vrhermit/Canvatorium">here</a>
      </p>
      <p>
        I have a GitHub Project
        <a href="https://github.com/users/vrhermit/projects/3/views/4">Board</a>
        setup that I use to track the status of each lab and idea.
      </p>
    </article>
  </div>
</template>

<script>
export default {
  name: "Home",
  components: {},
};
</script>

<style scoped>
.home {
  padding: 1rem;
  margin: 1rem;
  height: calc(100vh - 5rem);
}
article {
  margin-top: 0%;
}
</style>