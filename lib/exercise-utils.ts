export function formatTime(timeInSeconds: number) {
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = timeInSeconds % 60
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

export function formatSensorDataForCSV(data: { [key: string]: any[] }) {
  // Define the headers for the CSV
  const headers = ["AX", "AY", "AZ", "GX", "GY", "GZ", "MX", "MY", "MZ"];
  let csvContent = headers.join(",") + "\n";

  console.log('Formatting Sensor Data:', data);
 
  // Get the length of the first array to determine number of rows
  const firstKey = Object.keys(data)[0];
  const numRows = data[firstKey]?.length || 0;

  // Map through each index in parallel
  for (let i = 0; i < numRows; i++) {
    const row = headers.map(header => {
      const value = data[header]?.[i] ?? "";
      return `"${value}"`;
    });
    csvContent += row.join(",") + "\n";
  }

  console.log('Generated CSV Content:', csvContent);
  return csvContent;
}

export async function downloadCSV(exerciseId: string, customerData: any) {
  try {
    // Get token from localStorage
    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("Authentication required")
    }

    // Fetch exercise data from API with a flag to include all data (including sensor data)
    const response = await fetch(
      `/api/exercise-data/${exerciseId}?customerId=${customerData.id}&includeAllData=true`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to fetch exercise data")
    }

    const data = await response.json()
    const exerciseData = data.exerciseData
    const csvHeaders = data.csvHeaders

    if (!exerciseData || exerciseData.length === 0) {
      alert("No data available for this exercise")
      return
    }

    // Create CSV content with proper headers
    let csvContent = csvHeaders.join(",") + "\n"

    exerciseData.forEach((row: any) => {
      const values = csvHeaders.map((header: string) => {
        const value = row[header] || ""
        // Escape commas and quotes
        return `"${value.toString().replace(/"/g, '""')}"`
      })
      csvContent += values.join(",") + "\n"
    })

    // Create and download the exercise data CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${exerciseId}_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error("Error downloading CSV:", error)
    alert(error instanceof Error ? error.message : "An error occurred while downloading CSV")
  }
}

export function downloadSensorDataAsCSV(exerciseId: string, sensorData: { [key: string]: any[] }) {
  try {
    if (!sensorData || Object.keys(sensorData).length === 0) {
      console.log("No sensor data available for download");
      return;
    }

    const csvContent = formatSensorDataForCSV(sensorData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${exerciseId}_sensor_data_${new Date().toISOString().split("T")[0]}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading sensor data:", error);
  }
}

export async function uploadSensorData(exerciseId: string, sensorData: { [key: string]: any[] }, customerData: any) {
  if (Object.keys(sensorData).length === 0) {
    return;
  }

  // Convert sensor data to CSV format
  const csvContent = formatSensorDataForCSV(sensorData);
  const csvBlob = new Blob([csvContent], { type: 'text/csv' });
  const csvFile = new File([csvBlob], `${exerciseId}_${Date.now()}.csv`, { type: 'text/csv' });

  // Create form data and append the file and customerId
  const formData = new FormData();
  formData.append('file', csvFile);
  if (customerData && customerData.id) {
    formData.append('customerId', customerData.name);
  }

  // Upload to API
  const response = await fetch('/api/sensorupload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload sensor data');
  }
}
