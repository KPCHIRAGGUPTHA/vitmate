const handleRegister = async () => {
  try {
    const response = await fetch('https://vitmate.onrender.com/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        registerNumber,
        branch,
        year,
        rank,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Registration failed");
      return;
    }

    alert("Registration successful ✅");

  } catch (error) {
    console.error(error);
    alert("Something went wrong ❌");
  }
};